import { auditToolInvocation, checkRateLimit } from './security.js';

export const TOOL_ANNOTATIONS = {
  READ_ONLY: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  LIVE_API: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true
  }
};

function isLiveApiTool(options = {}) {
  return options.annotations?.destructiveHint === true || options.annotations?.openWorldHint === true;
}

function wrapLiveApiHandler(name, handler) {
  return async (args, extra) => {
    const userId = extra?.context?.userId || extra?.requestInfo?.userId || 'anonymous';
    const startedAt = Date.now();
    let result = null;

    if (!checkRateLimit(`tool:${name}:${userId}`)) {
      const error = new Error('Rate limit exceeded for live API tool');
      auditToolInvocation(name, args || {}, userId, null, error);
      throw error;
    }

    try {
      result = await handler(args, extra);
      auditToolInvocation(name, args || {}, userId, result, null);
      return result;
    } catch (error) {
      auditToolInvocation(name, args || {}, userId, null, error);
      throw error;
    } finally {
      const durationMs = Date.now() - startedAt;
      if (durationMs > 5000) {
        auditToolInvocation(`${name}:slow`, { durationMs }, userId, null, null);
      }
    }
  };
}

export function registerMcpTool(server, name, description, inputSchema, handler, options = {}) {
  const registeredHandler = isLiveApiTool(options) ? wrapLiveApiHandler(name, handler) : handler;
  return server.registerTool(name, {
    title: options.title,
    description,
    inputSchema,
    outputSchema: options.outputSchema,
    annotations: options.annotations,
    _meta: options._meta
  }, registeredHandler);
}

export function registerMcpPrompt(server, name, description, argsSchema, handler, options = {}) {
  return server.registerPrompt(name, {
    title: options.title,
    description,
    argsSchema
  }, handler);
}
