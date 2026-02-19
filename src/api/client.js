import { configPromise } from '../config.js';

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

function buildUrl(baseUrl, pathTemplate, pathParams) {
  let resolvedPath = pathTemplate;
  if (pathParams) {
    for (const [key, value] of Object.entries(pathParams)) {
      resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(value));
    }
  }
  return `${baseUrl}${resolvedPath}`;
}

function buildQueryString(queryParams) {
  if (!queryParams || Object.keys(queryParams).length === 0) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        params.set(key, JSON.stringify(value));
      } else {
        params.set(key, String(value));
      }
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function executeRequest({ component, method, pathTemplate, pathParams, queryParams, body }) {
  const config = await getConfig();
  const midazApi = config.midazApi || {};
  const baseUrl = getComponentUrl(midazApi, component);
  const url = buildUrl(baseUrl, pathTemplate, pathParams) + buildQueryString(queryParams);
  const timeout = midazApi.timeout || 30000;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (midazApi.authToken) {
    headers['Authorization'] = `Bearer ${midazApi.authToken}`;
  }

  const fetchOptions = {
    method: method.toUpperCase(),
    headers,
    signal: AbortSignal.timeout(timeout),
  };

  if (body && !['GET', 'HEAD', 'DELETE'].includes(method.toUpperCase())) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (method.toUpperCase() === 'HEAD') {
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      count: response.headers.get('Midaz-Total-Count') || response.headers.get('midaz-total-count'),
    };
  }

  if (method.toUpperCase() === 'DELETE' && response.status === 204) {
    return { status: 204, message: 'Successfully deleted' };
  }

  const contentType = response.headers.get('content-type') || '';
  let responseBody;
  if (contentType.includes('application/json')) {
    responseBody = await response.json();
  } else {
    responseBody = await response.text();
  }

  if (!response.ok) {
    const error = new Error(`Midaz API error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.body = responseBody;
    error.url = url;
    throw error;
  }

  return responseBody;
}

export async function checkHealth(component) {
  const config = await getConfig();
  const midazApi = config.midazApi || {};
  const baseUrl = getComponentUrl(midazApi, component);

  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    return { healthy: response.ok, status: response.status, component, url: baseUrl };
  } catch (err) {
    return { healthy: false, error: err.message, component, url: baseUrl };
  }
}
