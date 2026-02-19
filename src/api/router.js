import { getSchema, getAllSchemas } from './schemas/index.js';
import { executeRequest } from './client.js';

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

export async function routeAndExecute({ resource, action, pathParams, queryParams, body }) {
  const resolved = resolveAction(resource, action);
  if (resolved.error) {
    throw new Error(resolved.error);
  }

  if (resolved.pathParams) {
    const missingParams = [];
    for (const [paramName, paramDef] of Object.entries(resolved.pathParams)) {
      if (paramDef.required && (!pathParams || !pathParams[paramName])) {
        missingParams.push(paramName);
      }
    }
    if (missingParams.length > 0) {
      throw new Error(`Missing required path parameters: ${missingParams.join(', ')}`);
    }
  }

  return executeRequest({
    component: resolved.component,
    method: resolved.method,
    pathTemplate: resolved.pathTemplate,
    pathParams: pathParams || {},
    queryParams: queryParams || {},
    body: body || undefined,
  });
}

export function getEndpointCount() {
  let count = 0;
  for (const schema of getAllSchemas()) {
    count += Object.keys(schema.actions).length;
  }
  return count;
}
