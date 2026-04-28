import { z } from 'zod';
import { getSchema, findSchemas, listResources, getSchemasByComponent } from '../products/tracer/schemas/index.js';
import { resolveAction, getEndpointCount } from '../products/tracer/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const discoverInputSchema = {
  intent: z.enum(['list-resources', 'describe-resource', 'describe-action', 'search', 'list-by-component']).describe(
    'Discovery intent: list resources, inspect one resource, inspect one action, search, or filter by component.'
  ),
  resource: z.string().optional().describe('Tracer resource name (e.g. "rules", "limits", "validations", "audit-events", "system").'),
  action: z.string().optional().describe('Action name (e.g. "create", "list", "activate", "getUsage", "verifyHashChain").'),
  query: z.string().optional().describe('Search query for intent="search".'),
  component: z.enum(['rules', 'limits', 'validations', 'audit', 'operations']).optional().describe('Component filter for intent="list-by-component".')
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
          rules: resources.filter((item) => item.component === 'rules').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          limits: resources.filter((item) => item.component === 'limits').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          validations: resources.filter((item) => item.component === 'validations').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          audit: resources.filter((item) => item.component === 'audit').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          operations: resources.filter((item) => item.component === 'operations').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description }))
        },
        auth: {
          apiKeyHeader: 'Tracer uses X-API-Key from TRACER_API_KEY. Caller-provided X-API-Key headers are ignored.'
        },
        hint: 'Use intent="describe-action" with resource and action to inspect body shape, query filters, path params, and auth expectations.'
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
          responseType: actionDef.responseType || 'json',
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
        hint: 'Use intent="describe-action" with resource and action to inspect the full execution contract.'
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
        responseType: resolved.responseType,
        pathParams: Object.keys(resolved.pathParams).length > 0 ? resolved.pathParams : undefined,
        queryParams: Object.keys(resolved.queryParams).length > 0 ? resolved.queryParams : undefined,
        input: resolved.input || undefined,
        example: resolved.example || undefined,
        hint: 'Use tracer-execute with this resource/action. Tracer expects X-API-Key auth configured through TRACER_API_KEY.'
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

export function registerTracerDiscoverTool(server) {
  registerMcpTool(
    server,
    'tracer-discover',
    'Discover Tracer API resources, actions, and execution contracts. Use this before tracer-execute to inspect rule/limit operations, validation payloads, audit investigation filters, and operational endpoints.',
    discoverInputSchema,
    wrapToolHandler(handleDiscover),
    { annotations: TOOL_ANNOTATIONS.READ_ONLY }
  );
}
