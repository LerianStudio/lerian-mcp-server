import { getApiErrorDetail } from '../products/http-helpers.js';

function errorCodeForStatus(status, ErrorCodes) {
  if (status === 400 || status === 422) {
    return ErrorCodes.INVALID_PARAMS;
  }
  if (status === 401 || status === 403) {
    return ErrorCodes.RESOURCE_ACCESS_DENIED;
  }
  if (status === 404) {
    return ErrorCodes.RESOURCE_NOT_FOUND;
  }
  if (status === 429) {
    return ErrorCodes.RESOURCE_UNAVAILABLE;
  }
  return ErrorCodes.BACKEND_ERROR;
}

function messageForStatus(productName, status, authHint) {
  if (status === 400) {
    return `${productName} rejected the request as invalid (${status}). Inspect the action contract and sanitized error detail.`;
  }
  if (status === 401 || status === 403) {
    return `${productName} authentication/authorization failed (${status}). ${authHint}`;
  }
  if (status === 404) {
    return `${productName} resource was not found (${status}). Verify path parameters and the selected action.`;
  }
  if (status === 409) {
    return `${productName} reported a conflict (${status}).`;
  }
  if (status === 422) {
    return `${productName} validation failed (${status}). Inspect the sanitized error detail.`;
  }
  if (status === 429) {
    return `${productName} rate limit reached (${status}). Retry later.`;
  }
  if (status >= 500) {
    return `${productName} server error (${status}).`;
  }
  return `${productName} API error (${status}).`;
}

export function createProductApiErrorResponse({ productName, err, authHint, createErrorResponse, ErrorCodes }) {
  const status = Number(err.status);
  const detail = getApiErrorDetail(err);

  return createErrorResponse(
    errorCodeForStatus(status, ErrorCodes),
    messageForStatus(productName, status, authHint),
    detail
  );
}
