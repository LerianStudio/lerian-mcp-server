import { createSignedCursor } from './cursor-security.js';

const MAX_TOOL_RESPONSE_CHARS = 1024 * 1024;

export const ContentTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  RESOURCE: 'resource'
};

export const ErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  SERVER_ERROR: -32000
};

function stringifyResponseData(data) {
  if (data === null || data === undefined) {
    return '';
  }

  let text;
  try {
    text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  } catch (_error) {
    text = JSON.stringify({ serializationError: true, reason: 'Response could not be serialized safely' }, null, 2);
  }

  if (text.length <= MAX_TOOL_RESPONSE_CHARS) {
    return text;
  }

  return JSON.stringify({
    truncated: true,
    reason: `Tool response exceeded ${MAX_TOOL_RESPONSE_CHARS} characters`,
    preview: text.slice(0, MAX_TOOL_RESPONSE_CHARS)
  }, null, 2);
}

function canExposeStructuredContent(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  try {
    return JSON.stringify(data).length <= Math.min(MAX_TOOL_RESPONSE_CHARS, 128 * 1024);
  } catch (_error) {
    return false;
  }
}

export function createMcpToolResponse(data, contentType = ContentTypes.TEXT) {
  const response = {
    content: [{
      type: contentType,
      text: stringifyResponseData(data)
    }],
    isError: false
  };

  if (canExposeStructuredContent(data)) {
    response.structuredContent = data;
  }

  return response;
}

export function createMcpErrorContent(error, code = ErrorCodes.INTERNAL_ERROR) {
  const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
  const errorData = {
    error: errorMessage,
    code,
    details: error?.details || {}
  };

  if (process.env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
    errorData.stack = error.stack;
  }

  return {
    content: [{
      type: ContentTypes.TEXT,
      text: stringifyResponseData(errorData)
    }],
    structuredContent: errorData,
    isError: true
  };
}

export function createMcpPaginatedResponse(items, cursor, limit, totalCount = null) {
  const hasMore = totalCount ? items.length + (cursor || 0) < totalCount : items.length === limit;
  const nextCursor = hasMore ? createSignedCursor((cursor || 0) + items.length) : null;

  return createMcpToolResponse({
    items,
    pagination: {
      cursor: cursor || 0,
      nextCursor,
      hasMore,
      limit,
      totalCount
    }
  });
}
