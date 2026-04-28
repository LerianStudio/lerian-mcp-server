import { configPromise } from '../config.js';
import { executeJsonProductRequest } from '../products/http-helpers.js';

let configCache = null;

async function getConfig() {
  if (!configCache) {
    configCache = await configPromise;
  }
  return configCache;
}

function getComponentUrl(midazApi, component) {
  const urlMap = {
    onboarding: midazApi.onboardingUrl,
    transaction: midazApi.transactionUrl,
    crm: midazApi.crmUrl,
    ledger: midazApi.ledgerUrl,
  };
  return urlMap[component] || midazApi.onboardingUrl;
}

export async function executeRequest({ component, method, pathTemplate, pathParams, queryParams, body, mutationReason }) {
  const config = await getConfig();
  const midazApi = config.midazApi || {};
  const baseUrl = getComponentUrl(midazApi, component);
  return executeJsonProductRequest({
    productName: 'Midaz',
    baseUrl,
    method,
    pathTemplate,
    pathParams: pathParams || {},
    queryParams: queryParams || {},
    body,
    timeout: midazApi.timeout || 30000,
    authHeaders: midazApi.authToken ? { Authorization: `Bearer ${midazApi.authToken}` } : {},
    mutationReason
  });
}
