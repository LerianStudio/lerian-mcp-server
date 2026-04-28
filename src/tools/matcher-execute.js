import { z } from 'zod';
import { routeAndExecute } from '../products/matcher/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { createExecutionErrorResponse } from './execution-error.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const executeInputSchema = {
  resource: z.string().describe('Matcher resource name (e.g. "contexts", "sources", "field-maps", "discovery", "system").'),
  action: z.string().describe('Matcher action to perform (e.g. "create", "clone", "startExtraction", "getBridgeSummary").'),
  pathParams: z.record(z.string(), z.string()).optional().describe('Path parameters as key-value pairs.'),
  queryParams: z.record(z.string(), z.any()).optional().describe('Query parameters for list/filter actions.'),
  body: z.record(z.string(), z.any()).optional().describe('JSON request body for create/update actions.'),
  headers: z.record(z.string(), z.string()).optional().describe('Optional allowlisted headers from the action contract, such as X-Request-Id or X-Idempotency-Key.'),
  confirmMutation: z.boolean().optional().describe('Required as true for POST, PUT, PATCH, or DELETE live API actions.'),
  mutationReason: z.string().optional().describe('Human-readable audit reason required for mutating live API actions.')
};

async function handleExecute(args = {}) {
  args = args || {};
  const { resource, action, pathParams, queryParams, body, headers, confirmMutation, mutationReason } = args;

  if (!resource || !action) {
    return createErrorResponse(
      ErrorCodes.INVALID_PARAMS,
      'Both resource and action are required. Use matcher-discover first to inspect the available resources and action contracts.'
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
      productName: 'Matcher',
      err,
      authHint: 'Check MATCHER_AUTH_TOKEN configuration.',
      timeoutHint: 'Request timed out. Check if Matcher is running and MATCHER_BASE_URL is configured correctly.',
      unavailableHint: 'Cannot connect to Matcher API. Ensure the service is running and MATCHER_BASE_URL is set correctly.',
      createErrorResponse,
      ErrorCodes
    });
  }
}

export function registerMatcherExecuteTool(server) {
  registerMcpTool(
    server,
    'matcher-execute',
    'Execute Matcher API actions. The current live slice covers contexts, sources, field maps, discovery-over-Fetcher endpoints, matching runs, exceptions, disputes, governance, reporting, and system operations. Use matcher-discover first to inspect payloads, required headers, and reporting export behavior.',
    executeInputSchema,
    wrapToolHandler(handleExecute),
    { annotations: TOOL_ANNOTATIONS.LIVE_API }
  );
}
