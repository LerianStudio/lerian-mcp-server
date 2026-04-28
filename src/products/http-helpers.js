const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const DEFAULT_MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024;
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const PROTECTED_HEADER_NAMES = new Set(['authorization', 'x-api-key']);
const SECRET_KEY_PATTERN = /(authorization|token|password|secret|api[-_]?key|credential|cookie)/i;

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isMutationMethod(method) {
  return MUTATION_METHODS.has(String(method || '').toUpperCase());
}

export function getByteLimit(config, key, fallback) {
  const value = Number(config?.[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getMaxUploadBytes(config) {
  return getByteLimit(config, 'maxUploadBytes', DEFAULT_MAX_UPLOAD_BYTES);
}

export function getMaxDownloadBytes(config) {
  return getByteLimit(config, 'maxDownloadBytes', DEFAULT_MAX_DOWNLOAD_BYTES);
}

export function assertSizeWithinLimit(size, limit, label) {
  if (size > limit) {
    throw new Error(`${label} exceeds the configured ${limit} byte limit`);
  }
}

export function decodeUploadContent(value, maxUploadBytes) {
  if (!value || typeof value !== 'object' || typeof value.filename !== 'string' || typeof value.content !== 'string') {
    return null;
  }

  const encoding = value.encoding === 'base64' ? 'base64' : 'utf8';
  const buffer = Buffer.from(value.content, encoding);
  assertSizeWithinLimit(buffer.length, maxUploadBytes, `Multipart field "${value.filename}"`);

  return {
    buffer,
    filename: value.filename,
    contentType: value.contentType || 'application/octet-stream'
  };
}

export function normalizeBaseUrl(baseUrl) {
  if (!baseUrl || typeof baseUrl !== 'string') {
    throw new Error('Product API base URL is not configured');
  }

  const parsed = new URL(baseUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Product API base URL must use http or https');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Product API base URL must not include credentials');
  }

  const localhostNames = new Set(['localhost', '127.0.0.1', '::1', 'host.docker.internal']);
  const isLocalhost = localhostNames.has(parsed.hostname) || parsed.hostname.endsWith('.local');
  if (parsed.protocol !== 'https:' && !isLocalhost) {
    throw new Error('Product API base URL must use https outside localhost development');
  }

  return parsed.origin + parsed.pathname.replace(/\/$/, '');
}

function decodePathSegment(segment) {
  let decoded = segment;
  for (let index = 0; index < 3; index += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        return decoded;
      }
      decoded = next;
    } catch (_error) {
      throw new Error('Raw path parameter contains invalid percent encoding');
    }
  }

  return decoded;
}

export function encodePathValue(value, preserveSlashes = false) {
  const normalized = String(value ?? '').replace(/^\/+/, '').replace(/\/+$/, '');
  if (!normalized) {
    throw new Error('Path parameter cannot be empty');
  }

  if (!preserveSlashes) {
    return encodeURIComponent(normalized);
  }

  return normalized.split('/').map((segment) => {
    if (!segment) {
      throw new Error('Raw path parameter cannot contain empty path segments');
    }

    const decoded = decodePathSegment(segment);
    if (decoded === '.' || decoded === '..' || decoded.includes('/') || decoded.includes('\\') || /[\u0000-\u001f\u007f]/.test(decoded)) {
      throw new Error('Raw path parameter contains an unsafe path segment');
    }

    return encodeURIComponent(decoded);
  }).join('/');
}

export function buildUrl(baseUrl, pathTemplate, pathParams = {}, rawPathParams = []) {
  let resolvedPath = pathTemplate;
  for (const [key, value] of Object.entries(pathParams || {})) {
    resolvedPath = resolvedPath.replace(`:${key}`, encodePathValue(value, rawPathParams.includes(key)));
  }

  return `${normalizeBaseUrl(baseUrl)}${resolvedPath}`;
}

export function buildQueryString(queryParams = {}) {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return '';
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
      continue;
    }

    if (typeof value === 'object') {
      params.set(key, JSON.stringify(value));
      continue;
    }

    params.set(key, String(value));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function sanitizeCustomHeaders(customHeaders = {}, requestHeaders = {}) {
  if (!isObject(customHeaders)) {
    return {};
  }

  const allowedHeaders = new Map(
    Object.keys(requestHeaders || {}).map((headerName) => [headerName.toLowerCase(), headerName])
  );
  const sanitized = {};

  for (const [headerName, value] of Object.entries(customHeaders)) {
    const lowered = headerName.toLowerCase();
    if (!hasValue(value) || PROTECTED_HEADER_NAMES.has(lowered) || !allowedHeaders.has(lowered)) {
      continue;
    }

    sanitized[allowedHeaders.get(lowered)] = String(value);
  }

  return sanitized;
}

export function addMutationAuditHeaders(headers, mutationReason) {
  if (hasValue(mutationReason)) {
    headers['X-Lerian-MCP-Mutation-Reason'] = String(mutationReason).slice(0, 512);
  }
}

function validateRequiredFields(fields = {}, values = {}, label) {
  const missing = [];
  for (const [fieldName, fieldDef] of Object.entries(fields || {})) {
    if (fieldDef?.required && !hasValue(values?.[fieldName])) {
      missing.push(fieldName);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required ${label}: ${missing.join(', ')}`);
  }
}

function typeMatches(value, expectedType) {
  if (!hasValue(value) || !expectedType) {
    return true;
  }

  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return isObject(value);
    case 'array':
      return Array.isArray(value);
    default:
      return true;
  }
}

function validateFieldMap(fields = {}, values = {}, label) {
  const fieldDefs = fields || {};
  const suppliedValues = values || {};

  if (!isObject(suppliedValues)) {
    throw new Error(`${label} must be an object`);
  }

  validateRequiredFields(fieldDefs, suppliedValues, label);

  const allowed = new Set(Object.keys(fieldDefs));
  const unknown = Object.keys(suppliedValues).filter((key) => !allowed.has(key));
  if (unknown.length > 0) {
    throw new Error(`Unknown ${label}: ${unknown.join(', ')}`);
  }

  const invalid = [];
  for (const [fieldName, value] of Object.entries(suppliedValues)) {
    const expectedType = fieldDefs[fieldName]?.type;
    if (!typeMatches(value, expectedType)) {
      invalid.push(`${fieldName} must be ${expectedType}`);
      continue;
    }

    if (fieldName === 'limit' && hasValue(value) && (value < 1 || value > 1000)) {
      invalid.push('limit must be between 1 and 1000');
    }
  }

  if (invalid.length > 0) {
    throw new Error(`Invalid ${label}: ${invalid.join(', ')}`);
  }
}

export function validateActionRequest(action, { pathParams, queryParams, body, multipart, headers, confirmMutation, mutationReason } = {}) {
  validateFieldMap(action.pathParams || {}, pathParams || {}, 'path parameters');
  validateFieldMap(action.queryParams || {}, queryParams || {}, 'query parameters');
  validateFieldMap(action.requestHeaders || {}, headers || {}, 'headers');

  if (action.bodyType === 'multipart') {
    if (!multipart) {
      throw new Error('This action requires multipart input. Provide a multipart object instead of a JSON body.');
    }
    validateFieldMap(action.input || {}, multipart, 'multipart fields');
  } else if (action.bodyType === 'freeform-json') {
    if (body !== undefined && body !== null && typeof body !== 'object') {
      throw new Error('body fields must be a JSON object for this action');
    }
  } else {
    validateFieldMap(action.input || {}, body || {}, 'body fields');
  }

  if (isMutationMethod(action.method)) {
    if (confirmMutation !== true) {
      throw new Error(`confirmMutation=true is required before executing ${action.method} ${action.resource}.${action.action}`);
    }

    if (!hasValue(mutationReason)) {
      throw new Error('mutationReason is required for mutating live API actions');
    }
  }
}

async function readResponseBuffer(response, maxDownloadBytes, label) {
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > maxDownloadBytes) {
    assertSizeWithinLimit(contentLength, maxDownloadBytes, label);
  }

  if (!response.body || typeof response.body.getReader !== 'function') {
    return Buffer.alloc(0);
  }

  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = Buffer.from(value);
      totalBytes += chunk.length;
      if (totalBytes > maxDownloadBytes) {
        await reader.cancel();
        assertSizeWithinLimit(totalBytes, maxDownloadBytes, label);
      }
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock?.();
  }

  return Buffer.concat(chunks, totalBytes);
}

export async function readBinaryResponse(response, maxDownloadBytes) {
  const buffer = await readResponseBuffer(response, maxDownloadBytes, 'Binary response');

  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const contentDisposition = response.headers.get('content-disposition') || '';
  const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);

  return {
    fileName: fileNameMatch ? fileNameMatch[1] : null,
    contentType,
    size: buffer.length,
    base64: buffer.toString('base64')
  };
}

async function readLimitedTextResponse(response, maxDownloadBytes, label) {
  const buffer = await readResponseBuffer(response, maxDownloadBytes, label);
  return buffer.toString('utf8');
}

export async function parseResponseBody(response, { responseType = 'json', maxDownloadBytes = DEFAULT_MAX_DOWNLOAD_BYTES } = {}) {
  const contentType = response.headers.get('content-type') || '';
  const contentDisposition = response.headers.get('content-disposition') || '';
  const isAttachment = contentDisposition.includes('attachment');
  const isJson = contentType.includes('application/json');
  const isText = contentType.startsWith('text/');

  if (responseType === 'binary' || (!isJson && (!isText || isAttachment))) {
    return readBinaryResponse(response, maxDownloadBytes);
  }

  if (isJson) {
    const text = await readLimitedTextResponse(response, maxDownloadBytes, 'JSON response');
    if (!text.trim()) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      const parseError = error instanceof Error ? error.message : String(error);
      if (!response.ok) {
        return {
          parseError,
          rawBodyPreview: text.slice(0, 500)
        };
      }

      throw new Error(`Invalid JSON response: ${parseError}`);
    }
  }

  return readLimitedTextResponse(response, maxDownloadBytes, 'Text response');
}

function sanitizeValue(value, depth = 0) {
  if (depth > 4) {
    return '[truncated]';
  }

  if (typeof value === 'string') {
    return value.length > 2000 ? `${value.slice(0, 2000)}...[truncated]` : value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 25).map((item) => sanitizeValue(item, depth + 1));
  }

  if (isObject(value)) {
    const sanitized = {};
    for (const [key, nested] of Object.entries(value).slice(0, 50)) {
      sanitized[key] = SECRET_KEY_PATTERN.test(key) ? '[redacted]' : sanitizeValue(nested, depth + 1);
    }
    return sanitized;
  }

  return value;
}

export function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search ? '?[redacted]' : ''}`;
  } catch (_error) {
    return '[invalid-url]';
  }
}

export function createApiError(productName, response, responseBody, url) {
  const error = new Error(`${productName} API error: ${response.status} ${response.statusText}`);
  error.status = response.status;
  error.statusText = response.statusText;
  error.body = sanitizeValue(responseBody);
  error.url = sanitizeUrl(url);
  return error;
}

export function getApiErrorDetail(error) {
  return {
    status: error.status,
    statusText: error.statusText,
    url: error.url,
    body: error.body
  };
}

export async function executeJsonProductRequest({
  productName,
  baseUrl,
  method,
  pathTemplate,
  pathParams,
  rawPathParams = [],
  queryParams,
  body,
  timeout = 30000,
  authHeaders = {},
  extraHeaders = {},
  customHeaders = {},
  requestHeaders = {},
  responseType = 'json',
  maxDownloadBytes = DEFAULT_MAX_DOWNLOAD_BYTES,
  mutationReason
}) {
  const url = buildUrl(baseUrl, pathTemplate, pathParams, rawPathParams) + buildQueryString(queryParams);
  const upperMethod = method.toUpperCase();
  const headers = {
    Accept: 'application/json',
    ...sanitizeCustomHeaders(customHeaders, requestHeaders),
    ...extraHeaders,
    ...authHeaders
  };

  addMutationAuditHeaders(headers, mutationReason);

  const fetchOptions = {
    method: upperMethod,
    headers,
    signal: AbortSignal.timeout(timeout)
  };

  if (body && !['GET', 'HEAD', 'DELETE'].includes(upperMethod)) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (upperMethod === 'HEAD') {
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      count: response.headers.get('Midaz-Total-Count') || response.headers.get('midaz-total-count')
    };
  }

  if (response.status === 204) {
    return { status: 204, message: 'No content' };
  }

  const responseBody = await parseResponseBody(response, { responseType, maxDownloadBytes });

  if (!response.ok) {
    throw createApiError(productName, response, responseBody, url);
  }

  return responseBody;
}
