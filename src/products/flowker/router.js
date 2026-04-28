import { getSchema, getAllSchemas } from './schemas/index.js';
import { executeRequest } from './client.js';
import { sanitizeCustomHeaders, validateActionRequest } from '../http-helpers.js';

export function resolveAction(resource, action) {
  const schema = getSchema(resource);
  if (!schema) {
    return { error: `Unknown resource "${resource}". Use flowker-discover to list available resources.` };
  }

  const actionDef = schema.actions[action];
  if (!actionDef) {
    const available = Object.keys(schema.actions).join(', ');
    return { error: `Unknown action "${action}" for resource "${resource}". Available actions: ${available}` };
  }

  return {
    resource,
    action,
    component: schema.component,
    method: actionDef.method,
    pathTemplate: actionDef.path,
    pathParams: actionDef.pathParams || {},
    rawPathParams: actionDef.rawPathParams || [],
    queryParams: actionDef.queryParams || {},
    input: actionDef.input || null,
    requestHeaders: actionDef.requestHeaders || {},
    description: actionDef.description,
    example: actionDef.example || null
  };
}

export async function routeAndExecute({ resource, action, pathParams, queryParams, body, headers, confirmMutation, mutationReason }) {
  const resolved = resolveAction(resource, action);
  if (resolved.error) {
    throw new Error(resolved.error);
  }

  const safeHeaders = sanitizeCustomHeaders(headers, resolved.requestHeaders);
  validateActionRequest(resolved, { pathParams, queryParams, body, headers: safeHeaders, confirmMutation, mutationReason });

  return executeRequest({
    method: resolved.method,
    pathTemplate: resolved.pathTemplate,
    pathParams: pathParams || {},
    rawPathParams: resolved.rawPathParams,
    queryParams: queryParams || {},
    body: body || undefined,
    headers: safeHeaders,
    requestHeaders: resolved.requestHeaders,
    mutationReason
  });
}

export function getEndpointCount() {
  let count = 0;
  for (const schema of getAllSchemas()) {
    count += Object.keys(schema.actions).length;
  }

  return count;
}
