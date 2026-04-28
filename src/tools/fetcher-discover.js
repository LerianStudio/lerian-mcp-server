import { z } from 'zod';
import { getSchema, findSchemas, listResources, getSchemasByComponent } from '../products/fetcher/schemas/index.js';
import { resolveAction, getEndpointCount } from '../products/fetcher/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const discoverInputSchema = {
  intent: z.enum(['list-resources', 'describe-resource', 'describe-action', 'search', 'list-by-component']).describe(
    'Discovery intent: list resources, inspect one resource, inspect one action, search, or filter by component.'
  ),
  resource: z.string().optional().describe('Fetcher resource name (e.g. "connections", "connection-migrations", "fetcher-jobs").'),
  action: z.string().optional().describe('Action name (e.g. "create", "list", "validateSchema", "assign").'),
  query: z.string().optional().describe('Search query for intent="search".'),
  component: z.enum(['management', 'migration', 'fetcher']).optional().describe('Component filter for intent="list-by-component".')
};

async function handleDiscover(args = {}) {
  args = args || {};
  const { intent, resource, action, query, component } = args;

  switch (intent) {
    case 'list-resources': {
      const resources = listResources();
      const totalEndpoints = getEndpointCount();

      return createToolResponse({
        totalResources: resources.length,
        totalEndpoints,
        components: {
          management: resources.filter((item) => item.component === 'management').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          migration: resources.filter((item) => item.component === 'migration').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          fetcher: resources.filter((item) => item.component === 'fetcher').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description }))
        },
        contextHeaders: {
          organizationId: 'Most actions require organizationId and send it as X-Organization-Id.',
          productName: 'Some actions require or accept productName and send it as X-Product-Name.'
        },
        hint: 'Use intent="describe-action" with resource and action to inspect the exact path, context requirements, query params, and body shape.'
      });
    }

    case 'describe-resource': {
      if (!resource) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'resource parameter is required for describe-resource intent');
      }

      const schema = getSchema(resource);
      if (!schema) {
        const suggestions = findSchemas(resource);
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Resource "${resource}" not found.${suggestions.length > 0 ? ` Did you mean: ${suggestions.map((item) => item.resource).join(', ')}?` : ''}`);
      }

      const actions = {};
      for (const [actionName, actionDef] of Object.entries(schema.actions)) {
        actions[actionName] = {
          method: actionDef.method,
          path: actionDef.path,
          description: actionDef.description,
          requiresOrganizationId: !!actionDef.context?.organizationId?.required,
          requiresProductName: !!actionDef.context?.productName?.required,
          acceptsProductName: !!actionDef.context?.productName,
          hasInput: !!actionDef.input,
          hasPathParams: !!actionDef.pathParams && Object.keys(actionDef.pathParams).length > 0,
          hasQueryParams: !!actionDef.queryParams && Object.keys(actionDef.queryParams).length > 0
        };
      }

      return createToolResponse({
        resource: schema.resource,
        component: schema.component,
        description: schema.description,
        actions,
        hint: 'Use intent="describe-action" with resource and action to get the full execution contract.'
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
        context: Object.keys(resolved.context).length > 0 ? resolved.context : undefined,
        pathParams: Object.keys(resolved.pathParams).length > 0 ? resolved.pathParams : undefined,
        queryParams: Object.keys(resolved.queryParams).length > 0 ? resolved.queryParams : undefined,
        input: resolved.input || undefined,
        example: resolved.example || undefined,
        hint: 'Use fetcher-execute with this resource, action, organizationId, and any required productName/body/path params.'
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
        results: results.map((schema) => ({
          resource: schema.resource,
          component: schema.component,
          description: schema.description,
          actions: Object.keys(schema.actions)
        }))
      });
    }

    case 'list-by-component': {
      if (!component) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'component parameter is required for list-by-component intent');
      }

      const schemas = getSchemasByComponent(component);
      return createToolResponse({
        component,
        resources: schemas.map((schema) => ({
          resource: schema.resource,
          description: schema.description,
          actions: Object.keys(schema.actions)
        }))
      });
    }

    default:
      return createErrorResponse(ErrorCodes.INVALID_PARAMS, `Unknown intent: ${intent}`);
  }
}

export function registerFetcherDiscoverTool(server) {
  registerMcpTool(
    server,
    'fetcher-discover',
    'Discover Fetcher manager resources, actions, and execution contracts. Use this before fetcher-execute to inspect path params, required headers like organizationId/productName, body shapes, and supported migration/fetcher job operations.',
    discoverInputSchema,
    wrapToolHandler(handleDiscover),
    { annotations: TOOL_ANNOTATIONS.READ_ONLY }
  );
}
