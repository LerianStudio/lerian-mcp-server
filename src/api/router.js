import { getSchema, getAllSchemas } from './schemas/index.js';
import { executeRequest } from './client.js';
import { validateActionRequest } from '../products/http-helpers.js';

export function resolveAction(resource, action) {
  const schema = getSchema(resource);
  if (!schema) {
    return { error: `Unknown resource "${resource}". Use midaz-discover to list available resources.` };
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
    queryParams: actionDef.queryParams || {},
    input: actionDef.input || null,
    description: actionDef.description,
    example: actionDef.example || null,
  };
}

export async function routeAndExecute({ resource, action, pathParams, queryParams, body, confirmMutation, mutationReason }) {
  const resolved = resolveAction(resource, action);
  if (resolved.error) {
    throw new Error(resolved.error);
  }

  validateActionRequest(resolved, { pathParams, queryParams, body, confirmMutation, mutationReason });

  return executeRequest({
    component: resolved.component,
    method: resolved.method,
    pathTemplate: resolved.pathTemplate,
    pathParams: pathParams || {},
    queryParams: queryParams || {},
    body: body || undefined,
    mutationReason,
  });
}

export function getEndpointCount() {
  let count = 0;
  for (const schema of getAllSchemas()) {
    count += Object.keys(schema.actions).length;
  }
  return count;
}
