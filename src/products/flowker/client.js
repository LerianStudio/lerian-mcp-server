import { configPromise } from '../../config.js';
import { executeJsonProductRequest } from '../http-helpers.js';

let configCache = null;

async function getConfig() {
  if (!configCache) {
    configCache = await configPromise;
  }

  return configCache;
}

export async function executeRequest({ method, pathTemplate, pathParams, queryParams, body, headers: customHeaders, requestHeaders, rawPathParams = [], mutationReason }) {
  const config = await getConfig();
  const flowkerApi = config.flowkerApi || {};
  const baseUrl = flowkerApi.baseUrl;
  const timeout = flowkerApi.timeout || 30000;

  const authHeaders = {};
  if (flowkerApi.authToken) {
    authHeaders.Authorization = `Bearer ${flowkerApi.authToken}`;
  }

  if (flowkerApi.apiKey) {
    authHeaders['X-API-Key'] = flowkerApi.apiKey;
  }

  return executeJsonProductRequest({
    productName: 'Flowker',
    baseUrl,
    method,
    pathTemplate,
    pathParams,
    queryParams,
    body,
    timeout,
    authHeaders,
    customHeaders,
    requestHeaders,
    rawPathParams,
    mutationReason
  });
}
