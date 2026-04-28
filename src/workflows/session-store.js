import crypto from 'crypto';

const sessions = new Map();
const DEFAULT_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_SESSIONS = 100;
const MAX_SESSIONS_PER_SCOPE = 20;
const MAX_STEP_HISTORY = 25;
const MAX_SESSION_FIELD_BYTES = 64 * 1024;
const SECRET_KEY_PATTERN = /(authorization|token|password|secret|api[-_]?key|credential|cookie)/i;
const IMMUTABLE_CONTEXT_FIELDS = new Set(['tenantId', 'organizationId', 'ledgerId', 'productName', 'workflowOrganizationId']);

const cleanupInterval = setInterval(pruneExpiredSessions, 60 * 60 * 1000);
cleanupInterval.unref?.();

function nowIso() {
  return new Date().toISOString();
}

function expiresAtFrom(timestamp) {
  return new Date(new Date(timestamp).getTime() + DEFAULT_SESSION_TTL_MS).toISOString();
}

function isExpired(session) {
  return Date.parse(session.expiresAt) <= Date.now();
}

function pruneExpiredSessions() {
  for (const [sessionId, session] of sessions.entries()) {
    if (isExpired(session)) {
      sessions.delete(sessionId);
    }
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function hasValidSessionToken(session, sessionToken) {
  if (!sessionToken || !session?.sessionTokenHash) {
    return false;
  }

  const expected = Buffer.from(session.sessionTokenHash, 'hex');
  const actual = Buffer.from(hashToken(sessionToken), 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function enforceSessionLimit(scopeId) {
  const sameScope = [...sessions.values()]
    .filter((session) => session.scopeId === scopeId)
    .sort((left, right) => Date.parse(left.updatedAt) - Date.parse(right.updatedAt));

  if (sameScope.length > MAX_SESSIONS_PER_SCOPE) {
    for (const session of sameScope.slice(0, sameScope.length - MAX_SESSIONS_PER_SCOPE)) {
      sessions.delete(session.sessionId);
    }
  }

  if (sessions.size <= MAX_SESSIONS) {
    return;
  }

  const oldest = [...sessions.values()].sort((left, right) => Date.parse(left.updatedAt) - Date.parse(right.updatedAt));
  for (const session of oldest.slice(0, sessions.size - MAX_SESSIONS)) {
    sessions.delete(session.sessionId);
  }
}

function requireScope(scopeId) {
  if (!scopeId || typeof scopeId !== 'string') {
    throw new Error('scopeId is required for workflow session operations');
  }
}

function getScopedSession(sessionId, scopeId, sessionToken = null, { requireToken = true } = {}) {
  pruneExpiredSessions();
  requireScope(scopeId);
  const session = sessions.get(sessionId);
  if (!session || session.scopeId !== scopeId || isExpired(session)) {
    return null;
  }

  if (requireToken) {
    if (!hasValidSessionToken(session, sessionToken)) {
      return null;
    }
  }

  return session;
}

function sanitizeValue(value, depth = 0) {
  if (depth > 4) {
    return '[truncated]';
  }

  if (typeof value === 'string') {
    return value.length > 1000 ? `${value.slice(0, 1000)}...[truncated]` : value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
  }

  if (value && typeof value === 'object') {
    const sanitized = {};
    for (const [key, nested] of Object.entries(value).slice(0, 50)) {
      sanitized[key] = SECRET_KEY_PATTERN.test(key) ? '[redacted]' : sanitizeValue(nested, depth + 1);
    }
    return sanitized;
  }

  return value;
}

function summarizeResult(result) {
  if (!result || typeof result !== 'object') {
    return sanitizeValue(result);
  }

  return {
    type: Array.isArray(result) ? 'array' : 'object',
    keys: Object.keys(result).slice(0, 25),
    id: result.id || result.resourceId || result.sessionId || null
  };
}

function boundedSanitizedValue(value) {
  const sanitized = sanitizeValue(value);
  const serialized = JSON.stringify(sanitized);
  if (Buffer.byteLength(serialized, 'utf8') <= MAX_SESSION_FIELD_BYTES) {
    return sanitized;
  }

  return {
    truncated: true,
    reason: `Session field exceeded ${MAX_SESSION_FIELD_BYTES} bytes`,
    preview: serialized.slice(0, MAX_SESSION_FIELD_BYTES)
  };
}

function assertImmutableContext(existingContext = {}, patch = {}) {
  for (const field of IMMUTABLE_CONTEXT_FIELDS) {
    const existing = existingContext[field];
    const next = patch?.[field];
    if (existing !== undefined && next !== undefined && existing !== next) {
      throw new Error(`Cannot override immutable workflow session field "${field}"`);
    }
  }
}

function mergeContext(existingContext = {}, patch = {}) {
  assertImmutableContext(existingContext, patch);
  return boundedSanitizedValue({
    ...existingContext,
    ...(patch || {})
  });
}

export function createWorkflowSession(workflowId, initialInput = {}, { scopeId } = {}) {
  pruneExpiredSessions();
  requireScope(scopeId);
  const sessionId = crypto.randomUUID();
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const timestamp = nowIso();

  const session = {
    sessionId,
    scopeId,
    sessionTokenHash: hashToken(sessionToken),
    workflowId,
    createdAt: timestamp,
    updatedAt: timestamp,
    expiresAt: expiresAtFrom(timestamp),
    inputContext: boundedSanitizedValue(initialInput || {}),
    artifacts: {},
    completedSteps: [],
    stepHistory: []
  };

  sessions.set(sessionId, session);
  enforceSessionLimit(scopeId);
  return cloneSession(session, { includeSessionToken: true, sessionToken });
}

export function getWorkflowSession(sessionId, { scopeId, sessionToken } = {}) {
  const session = getScopedSession(sessionId, scopeId, sessionToken);
  return session ? cloneSession(session) : null;
}

export function getWorkflowSessionContext(sessionId, { scopeId, sessionToken } = {}) {
  const session = getScopedSession(sessionId, scopeId, sessionToken);
  return session ? { ...session.inputContext } : null;
}

export function listWorkflowSessions(workflowId = null, { scopeId, sessionToken, limit = 25 } = {}) {
  pruneExpiredSessions();
  requireScope(scopeId);

  return [...sessions.values()]
    .filter((session) => session.scopeId === scopeId && hasValidSessionToken(session, sessionToken) && (!workflowId || session.workflowId === workflowId))
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .slice(0, Math.max(1, Math.min(Number(limit) || 25, 100)))
    .map((session) => summarizeSession(session));
}

export function resetWorkflowSessions() {
  sessions.clear();
}

export function mergeWorkflowSessionInput(sessionId, input = {}, { scopeId, sessionToken } = {}) {
  const session = getScopedSession(sessionId, scopeId, sessionToken);
  if (!session) {
    return null;
  }

  session.inputContext = mergeContext(session.inputContext, input || {});
  session.updatedAt = nowIso();
  session.expiresAt = expiresAtFrom(session.updatedAt);
  return cloneSession(session);
}

export function previewWorkflowSessionInput(sessionId, input = {}, { scopeId, sessionToken } = {}) {
  const session = getScopedSession(sessionId, scopeId, sessionToken);
  if (!session) {
    return null;
  }

  return mergeContext(session.inputContext, input || {});
}

export function recordWorkflowStep(sessionId, { step, input, result, artifacts = {} }, { scopeId, sessionToken } = {}) {
  const session = getScopedSession(sessionId, scopeId, sessionToken);
  if (!session) {
    return null;
  }

  session.inputContext = mergeContext(session.inputContext, {
    ...(input || {}),
    ...(artifacts || {})
  });
  session.artifacts = boundedSanitizedValue({
    ...session.artifacts,
    ...(artifacts || {})
  });

  if (!session.completedSteps.includes(step)) {
    session.completedSteps.push(step);
  }

  session.stepHistory.push({
    step,
    executedAt: nowIso(),
    input: boundedSanitizedValue(input || {}),
    artifacts: boundedSanitizedValue(artifacts || {}),
    result: summarizeResult(result)
  });

  if (session.stepHistory.length > MAX_STEP_HISTORY) {
    session.stepHistory.splice(0, session.stepHistory.length - MAX_STEP_HISTORY);
  }

  session.updatedAt = nowIso();
  session.expiresAt = expiresAtFrom(session.updatedAt);
  return cloneSession(session);
}

function summarizeSession(session) {
  return {
    sessionId: session.sessionId,
    workflowId: session.workflowId,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    expiresAt: session.expiresAt,
    completedSteps: [...session.completedSteps],
    artifactKeys: Object.keys(session.artifacts),
    stepHistoryCount: session.stepHistory.length
  };
}

function cloneSession(session, { includeSessionToken = false, sessionToken = null } = {}) {
  return {
    sessionId: session.sessionId,
    scopeId: session.scopeId,
    ...(includeSessionToken ? { sessionToken } : {}),
    workflowId: session.workflowId,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    expiresAt: session.expiresAt,
    inputContext: boundedSanitizedValue(session.inputContext),
    artifacts: boundedSanitizedValue(session.artifacts),
    completedSteps: [...session.completedSteps],
    stepHistory: session.stepHistory.map((entry) => ({
      ...entry,
      input: boundedSanitizedValue(entry.input || {}),
      artifacts: boundedSanitizedValue(entry.artifacts || {})
    }))
  };
}
