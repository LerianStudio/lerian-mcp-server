import { getSchema, getAllSchemas } from './schemas/index.js';
import { executeRequest, resolveExecutionContext } from './client.js';
import { validateActionRequest } from '../http-helpers.js';

export function resolveAction(resource, action) {
  const schema = getSchema(resource);
  if (!schema) {
    return { error: `Unknown resource "${resource}". Use fetcher-discover to list available resources.` };
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
    bodyType: actionDef.bodyType || 'json',
    context: actionDef.context || {},
    requestHeaders: actionDef.requestHeaders || {},
    responseType: actionDef.responseType || 'json',
    description: actionDef.description,
    example: actionDef.example || null
  };
}

export async function routeAndExecute({ resource, action, pathParams, queryParams, body, organizationId, productName, confirmMutation, mutationReason }) {
  const resolved = resolveAction(resource, action);
  if (resolved.error) {
    throw new Error(resolved.error);
  }

  validateActionRequest(resolved, { pathParams, queryParams, body, confirmMutation, mutationReason });

  const resolvedContext = await resolveExecutionContext({ organizationId, productName });

  if (resolved.context.organizationId?.required && !resolvedContext.organizationId) {
    throw new Error('organizationId is required for this action. It will be sent as X-Organization-Id.');
  }

  if (resolved.context.productName?.required && !resolvedContext.productName) {
    throw new Error('productName is required for this action. It will be sent as X-Product-Name.');
  }

  return executeRequest({
    method: resolved.method,
    pathTemplate: resolved.pathTemplate,
    pathParams: pathParams || {},
    queryParams: queryParams || {},
    body: body || undefined,
    organizationId: resolvedContext.organizationId,
    productName: resolvedContext.productName,
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
