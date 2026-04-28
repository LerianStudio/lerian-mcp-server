import { configPromise } from '../../config.js';
import {
  addMutationAuditHeaders,
  buildQueryString,
  buildUrl,
  createApiError,
  decodeUploadContent,
  getMaxDownloadBytes,
  getMaxUploadBytes,
  parseResponseBody,
  sanitizeCustomHeaders
} from '../http-helpers.js';

let configCache = null;

async function getConfig() {
  if (!configCache) {
    configCache = await configPromise;
  }

  return configCache;
}

function buildMultipartForm(multipart = {}, maxUploadBytes) {
  const form = new FormData();

  for (const [key, value] of Object.entries(multipart)) {
    if (value === undefined || value === null) {
      continue;
    }

    const filePart = decodeUploadContent(value, maxUploadBytes);
    if (filePart) {
      form.append(key, new Blob([filePart.buffer], { type: filePart.contentType }), filePart.filename);
      continue;
    }

    form.append(key, String(value));
  }

  return form;
}

export async function executeRequest({ method, pathTemplate, pathParams, queryParams, body, multipart, headers: customHeaders, requestHeaders, responseType = 'json', mutationReason }) {
  const config = await getConfig();
  const reporterApi = config.reporterApi || {};
  const baseUrl = reporterApi.managerUrl;
  const url = buildUrl(baseUrl, pathTemplate, pathParams) + buildQueryString(queryParams);
  const timeout = reporterApi.timeout || 30000;
  const maxUploadBytes = getMaxUploadBytes(reporterApi);
  const maxDownloadBytes = getMaxDownloadBytes(reporterApi);

  const headers = {
    Accept: 'application/json',
    ...sanitizeCustomHeaders(customHeaders, requestHeaders)
  };

  if (reporterApi.authToken) {
    headers.Authorization = `Bearer ${reporterApi.authToken}`;
  }

  addMutationAuditHeaders(headers, mutationReason);

  const fetchOptions = {
    method: method.toUpperCase(),
    headers,
    signal: AbortSignal.timeout(timeout)
  };

  if (multipart && !['GET', 'HEAD', 'DELETE'].includes(method.toUpperCase())) {
    fetchOptions.body = buildMultipartForm(multipart, maxUploadBytes);
    delete headers['Content-Type'];
  } else if (body && !['GET', 'HEAD', 'DELETE'].includes(method.toUpperCase())) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (response.status === 204) {
    return { status: 204, message: 'No content' };
  }

  const responseBody = await parseResponseBody(response, { responseType, maxDownloadBytes });

  if (!response.ok) {
    throw createApiError('Reporter', response, responseBody, url);
  }

  return responseBody;
}
