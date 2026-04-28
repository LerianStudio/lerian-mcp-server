import { z } from 'zod';
import { routeAndExecute } from '../products/fetcher/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { createExecutionErrorResponse } from './execution-error.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const executeInputSchema = {
  resource: z.string().describe('Fetcher resource name (e.g. "connections", "connection-migrations", "fetcher-jobs").'),
  action: z.string().describe('Fetcher action to perform (e.g. "create", "list", "validateSchema", "assign").'),
  organizationId: z.string().optional().describe('Organization UUID sent as X-Organization-Id. Required explicitly for scoped actions.'),
  productName: z.string().optional().describe('Product name sent as X-Product-Name. Required explicitly for some actions like create/assign connection.'),
  pathParams: z.record(z.string(), z.string()).optional().describe('Path parameters as key-value pairs.'),
  queryParams: z.record(z.string(), z.any()).optional().describe('Query parameters for list/filter operations.'),
  body: z.record(z.string(), z.any()).optional().describe('Request body for create/update/validate operations.'),
  confirmMutation: z.boolean().optional().describe('Required as true for POST, PUT, PATCH, or DELETE live API actions.'),
  mutationReason: z.string().optional().describe('Human-readable audit reason required for mutating live API actions.')
};

async function handleExecute(args = {}) {
  args = args || {};
  const { resource, action, organizationId, productName, pathParams, queryParams, body, confirmMutation, mutationReason } = args;

  if (!resource || !action) {
    return createErrorResponse(
      ErrorCodes.INVALID_PARAMS,
      'Both resource and action are required. Use fetcher-discover first to inspect the available resources and action contracts.'
    );
  }

  try {
    const result = await routeAndExecute({
      resource,
      action,
      organizationId,
      productName,
      pathParams: pathParams || {},
      queryParams: queryParams || {},
      body: body || undefined,
      confirmMutation,
      mutationReason
    });

    return createToolResponse(result);
  } catch (err) {
    return createExecutionErrorResponse({
      productName: 'Fetcher',
      err,
      authHint: 'Check FETCHER_AUTH_TOKEN configuration.',
      timeoutHint: 'Request timed out. Check if the Fetcher manager is running and FETCHER_MANAGER_URL is configured correctly.',
      unavailableHint: 'Cannot connect to Fetcher API. Ensure the service is running and FETCHER_MANAGER_URL is set correctly.',
      createErrorResponse,
      ErrorCodes
    });
  }
}

export function registerFetcherExecuteTool(server) {
  registerMcpTool(
    server,
    'fetcher-execute',
    'Execute Fetcher manager API actions. Use fetcher-discover first to inspect the required organizationId/productName context, path params, query params, and request body shape before calling this tool.',
    executeInputSchema,
    wrapToolHandler(handleExecute),
    { annotations: TOOL_ANNOTATIONS.LIVE_API }
  );
}
