import { normalizeCaughtError } from '../util/mcp-helpers.js';
import { createProductApiErrorResponse } from './product-error-response.js';

const INVALID_PARAM_MARKERS = [
  'Unknown resource',
  'Unknown action',
  'Missing required',
  'Unknown path parameters',
  'Unknown query parameters',
  'Unknown body fields',
  'Unknown multipart fields',
  'Unknown headers',
  'Invalid path parameters',
  'Invalid query parameters',
  'Invalid body fields',
  'Invalid multipart fields',
  'Invalid headers',
  'confirmMutation=true is required',
  'mutationReason is required',
  'organizationId is required',
  'productName is required',
  'workflowOrganizationId must match organizationId',
  'Cannot override immutable workflow session field',
  'requires multipart input',
  'unsafe path segment',
  'Raw path parameter'
];

export function createExecutionErrorResponse({ productName, err, authHint, unavailableHint, timeoutHint, createErrorResponse, ErrorCodes }) {
  const normalized = normalizeCaughtError(err);
  const message = normalized.message;

  if (normalized.status) {
    return createProductApiErrorResponse({ productName, err: normalized.raw, authHint, createErrorResponse, ErrorCodes });
  }

  if (normalized.name === 'TimeoutError' || message.includes('timeout')) {
    return createErrorResponse(ErrorCodes.BACKEND_ERROR, timeoutHint);
  }

  if (INVALID_PARAM_MARKERS.some((marker) => message.includes(marker))) {
    return createErrorResponse(ErrorCodes.INVALID_PARAMS, message);
  }

  if (message.includes('fetch failed') || message.includes('ECONNREFUSED')) {
    return createErrorResponse(ErrorCodes.RESOURCE_UNAVAILABLE, unavailableHint);
  }

  return createErrorResponse(ErrorCodes.INTERNAL_ERROR, message);
}

export function classifyWorkflowExecutionError(err, ErrorCodes) {
  const normalized = normalizeCaughtError(err);
  const message = normalized.message;

  if (typeof normalized.code === 'number') {
    return { code: normalized.code, message, data: normalized.raw?.data || null };
  }

  if (normalized.status) {
    if (normalized.status === 400 || normalized.status === 422) {
      return { code: ErrorCodes.INVALID_PARAMS, message };
    }
    if (normalized.status === 401 || normalized.status === 403) {
      return { code: ErrorCodes.RESOURCE_ACCESS_DENIED, message };
    }
    if (normalized.status === 404) {
      return { code: ErrorCodes.RESOURCE_NOT_FOUND, message };
    }
    return { code: ErrorCodes.BACKEND_ERROR, message };
  }

  if (INVALID_PARAM_MARKERS.some((marker) => message.includes(marker))) {
    return { code: ErrorCodes.INVALID_PARAMS, message };
  }

  if (message.includes('fetch failed') || message.includes('ECONNREFUSED')) {
    return { code: ErrorCodes.RESOURCE_UNAVAILABLE, message };
  }

  if (normalized.name === 'TimeoutError' || message.includes('timeout')) {
    return { code: ErrorCodes.BACKEND_ERROR, message };
  }

  return { code: ErrorCodes.BACKEND_ERROR, message };
}
