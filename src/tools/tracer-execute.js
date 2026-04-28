import { z } from 'zod';
import { routeAndExecute } from '../products/tracer/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { createExecutionErrorResponse } from './execution-error.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const executeInputSchema = {
  resource: z.string().describe('Tracer resource name (e.g. "rules", "limits", "validations", "audit-events", "system").'),
  action: z.string().describe('Tracer action to perform (e.g. "create", "list", "activate", "getUsage", "verifyHashChain").'),
  pathParams: z.record(z.string(), z.string()).optional().describe('Path parameters as key-value pairs.'),
  queryParams: z.record(z.string(), z.any()).optional().describe('Query parameters for list/filter actions.'),
  body: z.record(z.string(), z.any()).optional().describe('JSON request body for create/update/validate actions.'),
  headers: z.record(z.string(), z.string()).optional().describe('Optional allowlisted headers from the action contract. Configured TRACER_API_KEY remains authoritative.'),
  confirmMutation: z.boolean().optional().describe('Required as true for POST, PUT, PATCH, or DELETE live API actions.'),
  mutationReason: z.string().optional().describe('Human-readable audit reason required for mutating live API actions.')
};

async function handleExecute(args = {}) {
  args = args || {};
  const { resource, action, pathParams, queryParams, body, headers, confirmMutation, mutationReason } = args;

  if (!resource || !action) {
    return createErrorResponse(
      ErrorCodes.INVALID_PARAMS,
      'Both resource and action are required. Use tracer-discover first to inspect the available resources and action contracts.'
    );
  }

  try {
    const result = await routeAndExecute({
      resource,
      action,
      pathParams: pathParams || {},
      queryParams: queryParams || {},
      body: body || undefined,
      headers: headers || undefined,
      confirmMutation,
      mutationReason
    });

    return createToolResponse(result);
  } catch (err) {
    return createExecutionErrorResponse({
      productName: 'Tracer',
      err,
      authHint: 'Check TRACER_API_KEY configuration.',
      timeoutHint: 'Request timed out. Check if Tracer is running and TRACER_BASE_URL is configured correctly.',
      unavailableHint: 'Cannot connect to Tracer API. Ensure the service is running and TRACER_BASE_URL is set correctly.',
      createErrorResponse,
      ErrorCodes
    });
  }
}

export function registerTracerExecuteTool(server) {
  registerMcpTool(
    server,
    'tracer-execute',
    'Execute Tracer API actions. Use tracer-discover first to inspect rule/limit transitions, validation request bodies, audit filters, and operational endpoints before calling this tool.',
    executeInputSchema,
    wrapToolHandler(handleExecute),
    { annotations: TOOL_ANNOTATIONS.LIVE_API }
  );
}
