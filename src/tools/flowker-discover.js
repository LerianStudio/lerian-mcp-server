import { z } from 'zod';
import { getSchema, findSchemas, listResources, getSchemasByComponent } from '../products/flowker/schemas/index.js';
import { resolveAction, getEndpointCount } from '../products/flowker/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const discoverInputSchema = {
  intent: z.enum(['list-resources', 'describe-resource', 'describe-action', 'search', 'list-by-component']).describe(
    'Discovery intent: list resources, inspect one resource, inspect one action, search, or filter by component.'
  ),
  resource: z.string().optional().describe('Flowker resource name (e.g. "workflows", "executions", "provider-configurations", "webhooks").'),
  action: z.string().optional().describe('Action name (e.g. "create", "start", "validateParams", "verifyHashChain", "post").'),
  query: z.string().optional().describe('Search query for intent="search".'),
  component: z.enum(['system', 'catalog', 'workflow', 'execution', 'provider-configuration', 'executor-configuration', 'observability', 'webhook']).optional().describe('Component filter for intent="list-by-component".')
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
          catalog: resources.filter((item) => item.component === 'catalog').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          workflow: resources.filter((item) => item.component === 'workflow').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          execution: resources.filter((item) => item.component === 'execution').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          'provider-configuration': resources.filter((item) => item.component === 'provider-configuration').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          'executor-configuration': resources.filter((item) => item.component === 'executor-configuration').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          observability: resources.filter((item) => item.component === 'observability').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description })),
          webhook: resources.filter((item) => item.component === 'webhook').map((item) => ({ resource: item.resource, actions: item.actions, description: item.description }))
        },
        auth: {
          bearerToken: 'Flowker accepts Authorization bearer tokens when auth is enabled. Configure FLOWKER_AUTH_TOKEN; caller-provided Authorization headers are ignored.',
          apiKey: 'Flowker also supports X-API-Key. Configure FLOWKER_API_KEY; caller-provided X-API-Key headers are ignored.',
          idempotency: 'Starting a workflow execution requires Idempotency-Key. Webhooks accept optional Idempotency-Key and X-Webhook-Token.'
        },
        hint: 'Use intent="describe-action" with resource and action to inspect request headers, path params, query filters, and body shape. For webhook calls, the action name selects the HTTP method.'
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
        hint: 'Use flowker-execute with this resource/action. For execution start you must provide Idempotency-Key; for webhooks, set the action to the HTTP method you want to use.'
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

export function registerFlowkerDiscoverTool(server) {
  registerMcpTool(
    server,
    'flowker-discover',
    'Discover Flowker API resources, actions, and execution contracts. Use this before flowker-execute to inspect workflow definitions, execution start requirements, provider and executor configuration payloads, audit filters, dashboard summaries, and webhook method/path behavior.',
    discoverInputSchema,
    wrapToolHandler(handleDiscover),
    { annotations: TOOL_ANNOTATIONS.READ_ONLY }
  );
}
