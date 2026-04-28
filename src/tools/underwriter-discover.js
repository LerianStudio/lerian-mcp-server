import { z } from 'zod';
import { getSchema, findSchemas, listResources, getSchemasByComponent } from '../products/underwriter/schemas/index.js';
import { resolveAction, getEndpointCount } from '../products/underwriter/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const discoverInputSchema = {
  intent: z.enum(['list-resources', 'describe-resource', 'describe-action', 'search', 'list-by-component']).describe(
    'Discovery intent: list resources, inspect one resource, inspect one action, search, or filter by component.'
  ),
  resource: z.string().optional().describe('Underwriter resource name (e.g. "jurisdictions", "loan-products", "loan-applications", "examples").'),
  action: z.string().optional().describe('Action name (e.g. "list", "create", "previewSchedule", "createVersion").'),
  query: z.string().optional().describe('Search query for intent="search".'),
  component: z.enum(['system', 'reference-data', 'origination', 'products', 'examples']).optional().describe('Component filter for intent="list-by-component".')
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
          system: resources.filter((item) => item.component === 'system').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          'reference-data': resources.filter((item) => item.component === 'reference-data').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          origination: resources.filter((item) => item.component === 'origination').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          products: resources.filter((item) => item.component === 'products').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          examples: resources.filter((item) => item.component === 'examples').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description }))
        },
        auth: {
          publicResources: 'System and jurisdiction discovery endpoints are public.',
          protectedResources: 'Loan products, schedule preview, and examples are bearer-protected in the mounted runtime. Configure UNDERWRITER_AUTH_TOKEN; caller-provided Authorization headers are ignored.'
        },
        hint: 'Use intent="describe-action" with resource and action to inspect auth, path params, pagination, and payload fields. Schedule preview expects decimal amounts as strings.'
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
          hasInput: !!actionDef.input,
          hasPathParams: !!actionDef.pathParams && Object.keys(actionDef.pathParams).length > 0,
          hasQueryParams: !!actionDef.queryParams && Object.keys(actionDef.queryParams).length > 0,
          hasRequestHeaders: !!actionDef.requestHeaders && Object.keys(actionDef.requestHeaders).length > 0
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
        requestHeaders: Object.keys(resolved.requestHeaders).length > 0 ? resolved.requestHeaders : undefined,
        pathParams: Object.keys(resolved.pathParams).length > 0 ? resolved.pathParams : undefined,
        queryParams: Object.keys(resolved.queryParams).length > 0 ? resolved.queryParams : undefined,
        input: resolved.input || undefined,
        example: resolved.example || undefined,
        hint: 'Use underwriter-execute with this resource/action. Protected routes accept Authorization bearer tokens, and schedule preview expects decimal amounts as strings.'
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

export function registerUnderwriterDiscoverTool(server) {
  registerMcpTool(
    server,
    'underwriter-discover',
    'Discover Underwriter API resources, actions, and execution contracts. Use this before underwriter-execute to inspect jurisdiction discovery, loan product lifecycle actions, schedule preview payloads, and the example endpoints currently mounted by the service.',
    discoverInputSchema,
    wrapToolHandler(handleDiscover),
    { annotations: TOOL_ANNOTATIONS.READ_ONLY }
  );
}
