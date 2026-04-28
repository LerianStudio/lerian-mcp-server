import { z } from 'zod';
import { routeAndExecute } from '../products/reporter/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { createExecutionErrorResponse } from './execution-error.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const executeInputSchema = {
  resource: z.string().describe('Reporter resource name (e.g. "templates", "reports", "data-sources", "deadlines", "metrics", "system").'),
  action: z.string().describe('Reporter action to perform (e.g. "create", "list", "download", "validateBlocks").'),
  pathParams: z.record(z.string(), z.string()).optional().describe('Path parameters as key-value pairs.'),
  queryParams: z.record(z.string(), z.any()).optional().describe('Query parameters for list/filter actions.'),
  body: z.record(z.string(), z.any()).optional().describe('JSON request body for standard JSON actions.'),
  multipart: z.record(z.string(), z.any()).optional().describe('Multipart form fields for template create/update. For file upload, use { template: { filename, content, contentType?, encoding? }, outputFormat, description }.'),
  headers: z.record(z.string(), z.string()).optional().describe('Optional allowlisted headers from the action contract, such as X-Idempotency.'),
  confirmMutation: z.boolean().optional().describe('Required as true for POST, PUT, PATCH, or DELETE live API actions.'),
  mutationReason: z.string().optional().describe('Human-readable audit reason required for mutating live API actions.')
};

async function handleExecute(args = {}) {
  args = args || {};
  const { resource, action, pathParams, queryParams, body, multipart, headers, confirmMutation, mutationReason } = args;

  if (!resource || !action) {
    return createErrorResponse(
      ErrorCodes.INVALID_PARAMS,
      'Both resource and action are required. Use reporter-discover first to inspect the available resources and action contracts.'
    );
  }

  try {
    const result = await routeAndExecute({
      resource,
      action,
      pathParams: pathParams || {},
      queryParams: queryParams || {},
      body: body || undefined,
      multipart: multipart || undefined,
      headers: headers || undefined,
      confirmMutation,
      mutationReason
    });

    return createToolResponse(result);
  } catch (err) {
    return createExecutionErrorResponse({
      productName: 'Reporter',
      err,
      authHint: 'Check REPORTER_AUTH_TOKEN configuration.',
      timeoutHint: 'Request timed out. Check if the Reporter manager is running and REPORTER_MANAGER_URL is configured correctly.',
      unavailableHint: 'Cannot connect to Reporter API. Ensure the service is running and REPORTER_MANAGER_URL is set correctly.',
      createErrorResponse,
      ErrorCodes
    });
  }
}

export function registerReporterExecuteTool(server) {
  registerMcpTool(
    server,
    'reporter-execute',
    'Execute Reporter manager API actions. Use reporter-discover first to inspect multipart requirements for template upload/update, request headers like X-Idempotency, and binary download behavior for report artifacts.',
    executeInputSchema,
    wrapToolHandler(handleExecute),
    { annotations: TOOL_ANNOTATIONS.LIVE_API }
  );
}
