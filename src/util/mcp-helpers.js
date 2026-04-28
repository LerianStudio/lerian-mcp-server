/**
 * MCP Protocol Helper Functions
 *
 * This module provides utilities for creating MCP-compliant responses
 * according to the Model Context Protocol specification.
 */

import { createSignedCursor, verifyAndDecodeCursor } from './cursor-security.js';

const MAX_TOOL_RESPONSE_CHARS = 1024 * 1024;
const SECRET_KEY_PATTERN = /(authorization|token|password|secret|api[-_]?key|credential|cookie)/i;
const SECRET_VALUE_PATTERN = /(bearer\s+[a-z0-9._~+/-]+=*|api[-_]?key\s*[:=]\s*[^\s,;]+|eyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+)/i;

export function normalizeCaughtError(error) {
  const objectLike = error !== null && typeof error === 'object';
  return {
    raw: error,
    code: objectLike ? error.code : undefined,
    status: objectLike ? error.status : undefined,
    statusText: objectLike ? error.statusText : undefined,
    name: objectLike ? error.name : undefined,
    message: error instanceof Error ? error.message : String(error ?? 'Unknown error'),
    service: objectLike ? error.service : undefined
  };
}

function redactString(value) {
  return SECRET_VALUE_PATTERN.test(value) ? '[redacted]' : value;
}

function sanitizeToolData(data, depth = 0, seen = new WeakSet(), allowSecretKeys = new Set()) {
  if (depth > 8) {
    return '[truncated]';
  }

  if (typeof data === 'string') {
    return redactString(data);
  }

  if (typeof data === 'bigint') {
    return data.toString();
  }

  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message
    };
  }

  if (Array.isArray(data)) {
    if (seen.has(data)) {
      return '[circular]';
    }
    seen.add(data);
    return data.map((item) => sanitizeToolData(item, depth + 1, seen, allowSecretKeys));
  }

  if (data && typeof data === 'object') {
    if (seen.has(data)) {
      return '[circular]';
    }
    seen.add(data);
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = SECRET_KEY_PATTERN.test(key) && !allowSecretKeys.has(key)
        ? '[redacted]'
        : sanitizeToolData(value, depth + 1, seen, allowSecretKeys);
    }
    return sanitized;
  }

  return data;
}

function safeJsonStringify(data, spacing = 2) {
  try {
    return JSON.stringify(data, null, spacing);
  } catch (_error) {
    return JSON.stringify({
      serializationError: true,
      reason: 'Tool response could not be serialized safely'
    }, null, spacing);
  }
}

function stringifyToolData(data, allowSecretKeys = new Set()) {
  if (data === undefined || data === null) {
    return '';
  }

  if (typeof data === 'string') {
    return redactString(data);
  }

  const sanitized = sanitizeToolData(data, 0, new WeakSet(), allowSecretKeys);
  const serialized = safeJsonStringify(sanitized, 2);
  if (serialized.length <= MAX_TOOL_RESPONSE_CHARS) {
    return serialized;
  }

  return JSON.stringify({
    truncated: true,
    reason: `Tool response exceeded ${MAX_TOOL_RESPONSE_CHARS} characters`,
    originalType: Array.isArray(data) ? 'array' : typeof data,
    keys: data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data).slice(0, 50) : undefined,
    preview: serialized.slice(0, MAX_TOOL_RESPONSE_CHARS)
  }, null, 2);
}

function canExposeStructuredContent(data) {
  if (data === null || data === undefined || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  const serialized = safeJsonStringify(data, 0);
  return serialized !== undefined &&
    serialized.length <= Math.min(MAX_TOOL_RESPONSE_CHARS, 128 * 1024);
}

function sanitizeErrorData(data) {
  return data === null ? null : sanitizeToolData(data);
}

function getPublicErrorData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const { originalError: _originalError, stack: _stack, ...publicData } = data;
  return publicData;
}

function isStructuredObject(data) {
  return data !== null &&
    typeof data === 'object' &&
    !Array.isArray(data);
}

/**
 * Create a successful MCP tool response
 * @param {any} data - The data to return
 * @param {string} mimeType - Optional MIME type (defaults to 'application/json')
 * @returns {Object} MCP-compliant response
 */
export function createToolResponse(data, mimeType = 'application/json') {
  const options = typeof mimeType === 'object' && mimeType !== null ? mimeType : {};
  const resolvedMimeType = typeof mimeType === 'string' ? mimeType : 'application/json';
  const allowSecretKeys = new Set(options.allowSecretKeys || []);
  const sanitizedData = sanitizeToolData(data, 0, new WeakSet(), allowSecretKeys);
  const response = {
    content: [{
      type: "text",
      text: stringifyToolData(sanitizedData, allowSecretKeys),
      mimeType: resolvedMimeType
    }],
    isError: false
  };

  if (isStructuredObject(sanitizedData) && canExposeStructuredContent(sanitizedData)) {
    response.structuredContent = sanitizedData;
  }

  return response;
}

/**
 * Create an error response following JSON-RPC 2.0 error codes
 * @param {number} code - JSON-RPC error code
 * @param {string} message - Error message
 * @param {any} data - Additional error data
 * @returns {Object} JSON-RPC compliant error
 */
export function createErrorResponse(code, message, data = null) {
  const error = {
    code,
    message
  };
  
  if (data !== null) {
    error.data = sanitizeErrorData(getPublicErrorData(data));
  }
  
  throw error;
}

/**
 * Standard JSON-RPC 2.0 error codes
 */
export const ErrorCodes = {
  // JSON-RPC 2.0 standard errors
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  
  // MCP-specific errors (using implementation-defined range)
  RESOURCE_NOT_FOUND: -32002,
  RESOURCE_ACCESS_DENIED: -32003,
  RESOURCE_UNAVAILABLE: -32004,
  BACKEND_ERROR: -32005,
};

/**
 * Create a paginated response with cursor support
 * @param {Array} items - Array of items
 * @param {Object} options - Pagination options
 * @param {Object} metadata - Optional metadata (e.g., { isStub: boolean, dataSource: string })
 * @returns {Object} Paginated response with cursor
 */
export function createPaginatedResponse(items, options = {}, metadata = {}) {
  const { cursor, limit = 10 } = options;

  let startIndex = 0;
  if (cursor) {
    // Decode HMAC-signed cursor
    try {
      const decoded = verifyAndDecodeCursor(cursor);
      startIndex = parseInt(decoded, 10);
    } catch (e) {
      throw createErrorResponse(ErrorCodes.INVALID_PARAMS, 'Invalid cursor');
    }
  }

  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  const hasMore = endIndex < items.length;

  const response = {
    items: paginatedItems,
    total: items.length
  };

  if (hasMore) {
    // Create HMAC-signed cursor for next page
    response.nextCursor = createSignedCursor(endIndex);
  }

  // Add metadata for data source indication
  if (Object.keys(metadata).length > 0) {
    response._metadata = {
      ...metadata,
      timestamp: new Date().toISOString()
    };
  }

  return createToolResponse(response);
}

/**
 * Wrap an async tool handler with proper error handling
 * @param {Function} handler - The async handler function
 * @returns {Function} Wrapped handler with MCP-compliant error handling
 */
export function wrapToolHandler(handler) {
  return async (args, extra) => {
    const safeArgs = args || {};
    try {
      const result = await handler(safeArgs, extra);
      
      // If handler returns an MCP response object, use it directly
      if (result && result.content && Array.isArray(result.content)) {
        return result;
      }
      
      // Otherwise, wrap in MCP response format
      return createToolResponse(result);
    } catch (error) {
      const normalized = normalizeCaughtError(error);
      // If it's already a JSON-RPC error, re-throw it
      if (typeof normalized.code === 'number') {
        throw error;
      }
      
      // Handle specific error types
      if (normalized.message.includes('not found')) {
        throw createErrorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          normalized.message,
          { resource: safeArgs.id || safeArgs.name }
        );
      }
      
      if (normalized.message.includes('unauthorized') || normalized.message.includes('forbidden')) {
        throw createErrorResponse(
          ErrorCodes.RESOURCE_ACCESS_DENIED,
          'Access denied to resource'
        );
      }
      
      if (normalized.message.includes('backend') || normalized.message.includes('API')) {
        throw createErrorResponse(
          ErrorCodes.BACKEND_ERROR,
          'Backend service unavailable',
          { service: normalized.service || 'unknown', status: normalized.status }
        );
      }
      
      // Default to internal error
      throw createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'An internal error occurred'
      );
    }
  };
}

/**
 * Validate tool arguments against a schema
 * @param {Object} args - Arguments to validate
 * @param {Object} schema - Zod schema or similar
 * @returns {Object} Validated arguments
 * @throws {Object} JSON-RPC error if validation fails
 */
export function validateArgs(args, schema) {
  try {
    if (schema.parse) {
      // Zod schema
      return schema.parse(args);
    } else if (schema.validate) {
      // Generic validation method
      const result = schema.validate(args);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
    return args;
  } catch (error) {
    const normalized = normalizeCaughtError(error);
    throw createErrorResponse(
      ErrorCodes.INVALID_PARAMS,
      'Invalid parameters',
      { validation: (normalized.raw && typeof normalized.raw === 'object' && normalized.raw.errors) || normalized.message }
    );
  }
}

/**
 * Log MCP tool invocation for monitoring
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Tool arguments
 * @param {Object} extra - Extra context from MCP
 * @returns {number} Start timestamp for duration tracking
 */
export function logToolInvocation(toolName, args, extra) {
  const timestamp = new Date().toISOString();
  const safeArgs = args || {};
  const logEntry = {
    timestamp,
    tool: toolName,
    args: Object.keys(safeArgs).length > 0 ? safeArgs : undefined,
    requestId: extra?.requestId
  };
  
  console.error(`[MCP Tool] ${JSON.stringify(logEntry)}`);
  return Date.now(); // Return start time for duration tracking
}
