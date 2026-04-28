import { configPromise } from '../../config.js';
import { executeJsonProductRequest } from '../http-helpers.js';

let configCache = null;

async function getConfig() {
  if (!configCache) {
    configCache = await configPromise;
  }

  return configCache;
}

export async function resolveExecutionContext({ organizationId, productName }) {
  return {
    organizationId: organizationId || '',
    productName: productName || ''
  };
}

export async function executeRequest({ method, pathTemplate, pathParams, queryParams, body, organizationId, productName, mutationReason }) {
  const config = await getConfig();
  const fetcherApi = config.fetcherApi || {};
  const baseUrl = fetcherApi.managerUrl;
  const resolvedContext = {
    organizationId: organizationId || '',
    productName: productName || ''
  };
  const timeout = fetcherApi.timeout || 30000;

  const extraHeaders = {};

  if (resolvedContext.organizationId) {
    extraHeaders['X-Organization-Id'] = resolvedContext.organizationId;
  }

  if (resolvedContext.productName) {
    extraHeaders['X-Product-Name'] = resolvedContext.productName;
  }

  return executeJsonProductRequest({
    productName: 'Fetcher',
    baseUrl,
    method,
    pathTemplate,
    pathParams,
    queryParams,
    body,
    timeout,
    authHeaders: fetcherApi.authToken ? { Authorization: `Bearer ${fetcherApi.authToken}` } : {},
    extraHeaders,
    mutationReason
  });
}
