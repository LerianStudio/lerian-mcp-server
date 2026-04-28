import { z } from 'zod';
import { getSchema, findSchemas, listResources, getSchemasByComponent } from '../products/matcher/schemas/index.js';
import { resolveAction, getEndpointCount } from '../products/matcher/router.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';

const MATCHER_COMPONENTS = ['configuration', 'discovery', 'matching', 'exceptions', 'governance', 'reporting', 'operations'];

const discoverInputSchema = {
  intent: z.enum(['list-resources', 'describe-resource', 'describe-action', 'search', 'list-by-component']).describe(
    'Discovery intent: list resources, inspect one resource, inspect one action, search, or filter by component.'
  ),
  resource: z.string().optional().describe('Matcher resource name (e.g. "contexts", "sources", "field-maps", "discovery", "system").'),
  action: z.string().optional().describe('Action name (e.g. "create", "clone", "startExtraction", "getBridgeSummary").'),
  query: z.string().optional().describe('Search query for intent="search".'),
  component: z.enum(MATCHER_COMPONENTS).optional().describe('Component filter for intent="list-by-component".')
};

async function handleDiscover(args = {}) {
  args = args || {};
  const { intent, resource, action, query, component } = args;

  switch (intent) {
    case 'list-resources': {
      const resources = listResources();
      const totalEndpoints = getEndpointCount();

      const components = Object.fromEntries(
        MATCHER_COMPONENTS.map((componentName) => [
          componentName,
          resources
            .filter((item) => item.component === componentName)
            .map((item) => ({ resource: item.resource, actions: item.actions, description: item.description }))
        ])
      );

      return createToolResponse({
        totalResources: resources.length,
        totalEndpoints,
        components,
        auth: {
          bearerToken: 'Matcher uses bearer auth from MATCHER_AUTH_TOKEN. Caller-provided Authorization headers are ignored.',
          traceHeader: 'Many matcher endpoints accept X-Request-Id for tracing and diagnostics.'
        },
        hint: 'Use intent="describe-action" with resource and action to inspect request headers, path params, query filters, and body shape.'
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
        responseType: resolved.responseType,
        requestHeaders: Object.keys(resolved.requestHeaders).length > 0 ? resolved.requestHeaders : undefined,
        pathParams: Object.keys(resolved.pathParams).length > 0 ? resolved.pathParams : undefined,
        queryParams: Object.keys(resolved.queryParams).length > 0 ? resolved.queryParams : undefined,
        input: resolved.input || undefined,
        example: resolved.example || undefined,
        hint: 'Use matcher-execute with this resource/action. For traceability, you can pass X-Request-Id through the headers object.'
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

export function registerMatcherDiscoverTool(server) {
  registerMcpTool(
    server,
    'matcher-discover',
    'Discover Matcher API resources, actions, and execution contracts. The current live slice covers contexts, sources, field maps, discovery-over-Fetcher endpoints, matching runs, exceptions, disputes, governance, reporting, and system operations. Use this before matcher-execute to inspect headers, path params, query filters, payload requirements, and export behavior.',
    discoverInputSchema,
    wrapToolHandler(handleDiscover),
    { annotations: TOOL_ANNOTATIONS.READ_ONLY }
  );
}
