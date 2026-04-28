import { configPromise } from '../../config.js';
import { executeJsonProductRequest, getMaxDownloadBytes } from '../http-helpers.js';

let configCache = null;

async function getConfig() {
  if (!configCache) {
    configCache = await configPromise;
  }

  return configCache;
}

export async function executeRequest({ method, pathTemplate, pathParams, queryParams, body, headers: customHeaders, requestHeaders, responseType = 'json', mutationReason }) {
  const config = await getConfig();
  const matcherApi = config.matcherApi || {};
  const baseUrl = matcherApi.baseUrl;
  const timeout = matcherApi.timeout || 30000;
  const maxDownloadBytes = getMaxDownloadBytes(matcherApi);

  return executeJsonProductRequest({
    productName: 'Matcher',
    baseUrl,
    method,
    pathTemplate,
    pathParams,
    queryParams,
    body,
    timeout,
    authHeaders: matcherApi.authToken ? { Authorization: `Bearer ${matcherApi.authToken}` } : {},
    customHeaders,
    requestHeaders,
    responseType,
    maxDownloadBytes,
    mutationReason
  });
}
