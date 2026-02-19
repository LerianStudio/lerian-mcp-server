import { z } from 'zod';
import { getSchema, findSchemas, listResources, getSchemasByComponent } from '../api/schemas/index.js';
import { resolveAction, getEndpointCount } from '../api/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';

const discoverInputSchema = {
  intent: z.enum(['list-resources', 'describe-resource', 'describe-action', 'search', 'list-by-component']).describe(
    'Discovery intent: "list-resources" (all resources), "describe-resource" (details+actions for one resource), "describe-action" (full schema for resource+action), "search" (fuzzy search), "list-by-component" (resources in a component)'
  ),
  resource: z.string().optional().describe('Resource name (e.g. "organizations", "transactions", "holders")'),
  action: z.string().optional().describe('Action name (e.g. "create", "get", "list", "createInflow")'),
  query: z.string().optional().describe('Search query for intent="search"'),
  component: z.enum(['onboarding', 'transaction', 'crm', 'ledger']).optional().describe('Component filter for intent="list-by-component"'),
};

async function handleDiscover(args) {
  const { intent, resource, action, query, component } = args;

  switch (intent) {
    case 'list-resources': {
      const resources = listResources();
      const totalEndpoints = getEndpointCount();
      return createToolResponse({
        totalResources: resources.length,
        totalEndpoints,
        components: {
          onboarding: resources.filter(r => r.component === 'onboarding').map(r => ({ resource: r.resource, actions: r.actions, description: r.description })),
          transaction: resources.filter(r => r.component === 'transaction').map(r => ({ resource: r.resource, actions: r.actions, description: r.description })),
          crm: resources.filter(r => r.component === 'crm').map(r => ({ resource: r.resource, actions: r.actions, description: r.description })),
          ledger: resources.filter(r => r.component === 'ledger').map(r => ({ resource: r.resource, actions: r.actions, description: r.description })),
        },
        hint: 'Use intent="describe-resource" with a resource name to see its actions, or intent="describe-action" with resource+action for the full input schema.',
      });
    }

    case 'describe-resource': {
      if (!resource) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'resource parameter is required for describe-resource intent');
      }
      const schema = getSchema(resource);
      if (!schema) {
        const suggestions = findSchemas(resource);
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Resource "${resource}" not found.${suggestions.length > 0 ? ` Did you mean: ${suggestions.map(s => s.resource).join(', ')}?` : ''}`);
      }
      const actions = {};
      for (const [actionName, actionDef] of Object.entries(schema.actions)) {
        actions[actionName] = {
          method: actionDef.method,
          path: actionDef.path,
          description: actionDef.description,
          hasInput: !!actionDef.input,
          hasPathParams: !!actionDef.pathParams && Object.keys(actionDef.pathParams).length > 0,
          hasQueryParams: !!actionDef.queryParams && Object.keys(actionDef.queryParams).length > 0,
        };
      }
      return createToolResponse({
        resource: schema.resource,
        component: schema.component,
        description: schema.description,
        actions,
        hint: 'Use intent="describe-action" with resource and action to get the full input schema for a specific action.',
      });
    }

    case 'describe-action': {
      if (!resource || !action) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'Both resource and action parameters are required for describe-action intent');
      }
      const resolved = resolveAction(resource, action);
      if (resolved.error) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, resolved.error);
      }
      return createToolResponse({
        resource,
        action,
        component: resolved.component,
        method: resolved.method,
        path: resolved.pathTemplate,
        description: resolved.description,
        pathParams: Object.keys(resolved.pathParams).length > 0 ? resolved.pathParams : undefined,
        queryParams: Object.keys(resolved.queryParams).length > 0 ? resolved.queryParams : undefined,
        input: resolved.input || undefined,
        example: resolved.example || undefined,
        hint: 'Use midaz-execute with this resource, action, and the required parameters to call the API.',
      });
    }

    case 'search': {
      if (!query) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'query parameter is required for search intent');
      }
      const results = findSchemas(query);
      if (results.length === 0) {
        return createToolResponse({ results: [], message: `No resources found matching "${query}".` });
      }
      return createToolResponse({
        query,
        results: results.map(s => ({
          resource: s.resource,
          component: s.component,
          description: s.description,
          actions: Object.keys(s.actions),
        })),
      });
    }

    case 'list-by-component': {
      if (!component) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'component parameter is required for list-by-component intent');
      }
      const schemas = getSchemasByComponent(component);
      return createToolResponse({
        component,
        resources: schemas.map(s => ({
          resource: s.resource,
          description: s.description,
          actions: Object.keys(s.actions),
        })),
      });
    }

    default:
      return createErrorResponse(ErrorCodes.INVALID_PARAMS, `Unknown intent: ${intent}`);
  }
}

export function registerDiscoverTool(server) {
  server.tool(
    'midaz-discover',
    'Discover Midaz API resources, actions, and schemas. Use this BEFORE calling midaz-execute to find the right resource+action and understand required parameters. Supports listing all resources, describing specific resources/actions, searching, and filtering by component.',
    discoverInputSchema,
    wrapToolHandler(handleDiscover)
  );
}
