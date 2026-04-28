import { z } from 'zod';
import { routeAndExecute } from '../products/flowker/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { createExecutionErrorResponse } from './execution-error.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const executeInputSchema = {
  resource: z.string().describe('Flowker resource name (e.g. "workflows", "executions", "provider-configurations", "webhooks").'),
  action: z.string().describe('Flowker action to perform (e.g. "create", "start", "validateConfig", "verifyHashChain", "post").'),
  pathParams: z.record(z.string(), z.string()).optional().describe('Path parameters as key-value pairs. For webhooks, path can include nested segments like "payments/kyc/callback".'),
  queryParams: z.record(z.string(), z.any()).optional().describe('Query parameters for list/filter actions.'),
  body: z.record(z.string(), z.any()).optional().describe('JSON request body for create/update/validate actions, workflow execution start, and webhook payloads.'),
  headers: z.record(z.string(), z.string()).optional().describe('Optional allowlisted headers from the action contract, such as Idempotency-Key or X-Webhook-Token.'),
  confirmMutation: z.boolean().optional().describe('Required as true for POST, PUT, PATCH, or DELETE live API actions.'),
  mutationReason: z.string().optional().describe('Human-readable audit reason required for mutating live API actions.')
};

async function handleExecute(args = {}) {
  args = args || {};
  const { resource, action, pathParams, queryParams, body, headers, confirmMutation, mutationReason } = args;

  if (!resource || !action) {
    return createErrorResponse(
      ErrorCodes.INVALID_PARAMS,
      'Both resource and action are required. Use flowker-discover first to inspect the available resources and action contracts.'
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
      productName: 'Flowker',
      err,
      authHint: 'Check FLOWKER_AUTH_TOKEN and FLOWKER_API_KEY configuration.',
      timeoutHint: 'Request timed out. Check if Flowker is running and FLOWKER_BASE_URL is configured correctly.',
      unavailableHint: 'Cannot connect to Flowker API. Ensure the service is running and FLOWKER_BASE_URL is set correctly.',
      createErrorResponse,
      ErrorCodes
    });
  }
}

export function registerFlowkerExecuteTool(server) {
  registerMcpTool(
    server,
    'flowker-execute',
    'Execute Flowker API actions. Use flowker-discover first to inspect auth expectations, Idempotency-Key requirements for workflow execution start, provider and executor configuration payloads, and webhook method/path behavior.',
    executeInputSchema,
    wrapToolHandler(handleExecute),
    { annotations: TOOL_ANNOTATIONS.LIVE_API }
  );
}
