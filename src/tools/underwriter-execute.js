import { z } from 'zod';
import { routeAndExecute } from '../products/underwriter/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { createExecutionErrorResponse } from './execution-error.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const executeInputSchema = {
  resource: z.string().describe('Underwriter resource name (e.g. "jurisdictions", "loan-products", "loan-applications", "examples").'),
  action: z.string().describe('Underwriter action to perform (e.g. "list", "create", "previewSchedule", "createVersion").'),
  pathParams: z.record(z.string(), z.string()).optional().describe('Path parameters as key-value pairs.'),
  queryParams: z.record(z.string(), z.any()).optional().describe('Query parameters for list/filter actions.'),
  body: z.record(z.string(), z.any()).optional().describe('JSON request body for create/update/simulation actions.'),
  headers: z.record(z.string(), z.string()).optional().describe('Optional allowlisted headers from the action contract. Configured UNDERWRITER_AUTH_TOKEN remains authoritative.'),
  confirmMutation: z.boolean().optional().describe('Required as true for POST, PUT, PATCH, or DELETE live API actions.'),
  mutationReason: z.string().optional().describe('Human-readable audit reason required for mutating live API actions.')
};

async function handleExecute(args = {}) {
  args = args || {};
  const { resource, action, pathParams, queryParams, body, headers, confirmMutation, mutationReason } = args;

  if (!resource || !action) {
    return createErrorResponse(
      ErrorCodes.INVALID_PARAMS,
      'Both resource and action are required. Use underwriter-discover first to inspect the available resources and action contracts.'
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
      productName: 'Underwriter',
      err,
      authHint: 'Check UNDERWRITER_AUTH_TOKEN configuration.',
      timeoutHint: 'Request timed out. Check if Underwriter is running and UNDERWRITER_BASE_URL is configured correctly.',
      unavailableHint: 'Cannot connect to Underwriter API. Ensure the service is running and UNDERWRITER_BASE_URL is set correctly.',
      createErrorResponse,
      ErrorCodes
    });
  }
}

export function registerUnderwriterExecuteTool(server) {
  registerMcpTool(
    server,
    'underwriter-execute',
    'Execute Underwriter API actions. Use underwriter-discover first to inspect bearer-auth requirements for protected routes, loan product path/query contracts, and the schedule preview payload where decimal amounts are encoded as strings.',
    executeInputSchema,
    wrapToolHandler(handleExecute),
    { annotations: TOOL_ANNOTATIONS.LIVE_API }
  );
}
