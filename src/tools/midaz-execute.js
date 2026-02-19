import { z } from 'zod';
import { routeAndExecute } from '../api/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';

const executeInputSchema = {
  resource: z.string().describe('Resource name (e.g. "organizations", "transactions", "holders", "balances")'),
  action: z.string().describe('Action to perform (e.g. "create", "get", "list", "update", "delete", "createInflow")'),
  pathParams: z.record(z.string(), z.string()).optional().describe('Path parameters as key-value pairs (e.g. { organizationId: "uuid", ledgerId: "uuid" })'),
  queryParams: z.record(z.string(), z.any()).optional().describe('Query parameters for list/search operations (e.g. { limit: 10, page: 1 })'),
  body: z.record(z.string(), z.any()).optional().describe('Request body for create/update operations'),
};

async function handleExecute(args) {
  const { resource, action, pathParams, queryParams, body } = args;

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
    });

    return createToolResponse(result);
  } catch (err) {
    if (err.status) {
      const errorDetail = {
        status: err.status,
        statusText: err.statusText,
        url: err.url,
        body: err.body,
      };

      if (err.status === 400) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, `Bad request: ${JSON.stringify(err.body)}`, errorDetail);
      }
      if (err.status === 401 || err.status === 403) {
        return createErrorResponse(ErrorCodes.RESOURCE_ACCESS_DENIED, `Authentication/authorization error (${err.status}). Check MIDAZ_AUTH_TOKEN configuration.`, errorDetail);
      }
      if (err.status === 404) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Resource not found: ${err.url}`, errorDetail);
      }
      if (err.status === 409) {
        return createErrorResponse(ErrorCodes.BACKEND_ERROR, `Conflict: ${JSON.stringify(err.body)}`, errorDetail);
      }
      if (err.status >= 500) {
        return createErrorResponse(ErrorCodes.BACKEND_ERROR, `Midaz server error (${err.status}): ${JSON.stringify(err.body)}`, errorDetail);
      }

      return createErrorResponse(ErrorCodes.BACKEND_ERROR, `API error (${err.status}): ${err.message}`, errorDetail);
    }

    if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
      return createErrorResponse(ErrorCodes.BACKEND_ERROR, `Request timed out. Check if the Midaz service is running and MIDAZ_*_URL is configured correctly.`);
    }

    if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
      return createErrorResponse(ErrorCodes.RESOURCE_UNAVAILABLE, `Cannot connect to Midaz API. Ensure the service is running and environment variables MIDAZ_ONBOARDING_URL, MIDAZ_TRANSACTION_URL, MIDAZ_CRM_URL, MIDAZ_LEDGER_URL are set correctly.`);
    }

    return createErrorResponse(ErrorCodes.INTERNAL_ERROR, err.message);
  }
}

export function registerExecuteTool(server) {
  server.tool(
    'midaz-execute',
    'Execute Midaz API operations. Use midaz-discover first to find the right resource+action and required parameters, then call this tool to execute. Supports all CRUD operations across organizations, ledgers, assets, accounts, transactions, balances, holders, aliases, and more.',
    executeInputSchema,
    wrapToolHandler(handleExecute)
  );
}
