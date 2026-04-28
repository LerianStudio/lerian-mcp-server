import { z } from 'zod';
import { routeAndExecute } from '../api/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { createExecutionErrorResponse } from './execution-error.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const executeInputSchema = {
  resource: z.string().describe('Resource name (e.g. "organizations", "transactions", "holders", "balances")'),
  action: z.string().describe('Action to perform (e.g. "create", "get", "list", "update", "delete", "createInflow")'),
  pathParams: z.record(z.string(), z.string()).optional().describe('Path parameters as key-value pairs (e.g. { organizationId: "uuid", ledgerId: "uuid" })'),
  queryParams: z.record(z.string(), z.any()).optional().describe('Query parameters for list/search operations (e.g. { limit: 10, page: 1 })'),
  body: z.record(z.string(), z.any()).optional().describe('Request body for create/update operations'),
  confirmMutation: z.boolean().optional().describe('Required as true for POST, PUT, PATCH, or DELETE live API actions.'),
  mutationReason: z.string().optional().describe('Human-readable audit reason required for mutating live API actions.'),
};

async function handleExecute(args = {}) {
  args = args || {};
  const { resource, action, pathParams, queryParams, body, confirmMutation, mutationReason } = args;

  if (!resource || !action) {
    return createErrorResponse(
      ErrorCodes.INVALID_PARAMS,
      'Both resource and action are required. Use midaz-discover first to find available resources and actions.'
    );
  }

  try {
    const result = await routeAndExecute({
      resource,
      action,
      pathParams: pathParams || {},
      queryParams: queryParams || {},
      body: body || undefined,
      confirmMutation,
      mutationReason,
    });

    return createToolResponse(result);
  } catch (err) {
    return createExecutionErrorResponse({
      productName: 'Midaz',
      err,
      authHint: 'Check MIDAZ_AUTH_TOKEN configuration.',
      timeoutHint: 'Request timed out. Check if the Midaz service is running and MIDAZ_*_URL is configured correctly.',
      unavailableHint: 'Cannot connect to Midaz API. Ensure the service is running and environment variables MIDAZ_ONBOARDING_URL, MIDAZ_TRANSACTION_URL, MIDAZ_CRM_URL, MIDAZ_LEDGER_URL are set correctly.',
      createErrorResponse,
      ErrorCodes
    });
  }
}

export function registerExecuteTool(server) {
  registerMcpTool(
    server,
    'midaz-execute',
    'Execute Midaz API operations. Use midaz-discover first to find the right resource+action and required parameters, then call this tool to execute. Supports all CRUD operations across organizations, ledgers, assets, accounts, transactions, balances, holders, aliases, and more.',
    executeInputSchema,
    wrapToolHandler(handleExecute),
    { annotations: TOOL_ANNOTATIONS.LIVE_API }
  );
}
