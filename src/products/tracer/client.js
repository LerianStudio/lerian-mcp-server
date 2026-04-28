import { configPromise } from '../../config.js';
import { executeJsonProductRequest } from '../http-helpers.js';

let configCache = null;

async function getConfig() {
  if (!configCache) {
    configCache = await configPromise;
  }

  return configCache;
}

export async function executeRequest({ method, pathTemplate, pathParams, queryParams, body, headers: customHeaders, requestHeaders, mutationReason }) {
  const config = await getConfig();
  const tracerApi = config.tracerApi || {};
  const baseUrl = tracerApi.baseUrl;
  const timeout = tracerApi.timeout || 30000;

  return executeJsonProductRequest({
    productName: 'Tracer',
    baseUrl,
    method,
    pathTemplate,
    pathParams,
    queryParams,
    body,
    timeout,
    authHeaders: tracerApi.apiKey ? { 'X-API-Key': tracerApi.apiKey } : {},
    customHeaders,
    requestHeaders,
    mutationReason
  });
}
