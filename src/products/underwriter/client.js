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
  const underwriterApi = config.underwriterApi || {};
  const baseUrl = underwriterApi.baseUrl;
  const timeout = underwriterApi.timeout || 30000;

  return executeJsonProductRequest({
    productName: 'Underwriter',
    baseUrl,
    method,
    pathTemplate,
    pathParams,
    queryParams,
    body,
    timeout,
    authHeaders: underwriterApi.authToken ? { Authorization: `Bearer ${underwriterApi.authToken}` } : {},
    customHeaders,
    requestHeaders,
    mutationReason
  });
}
