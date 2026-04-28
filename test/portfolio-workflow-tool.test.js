import test from 'node:test';
import assert from 'node:assert/strict';

import { registerPortfolioWorkflowTool } from '../src/tools/portfolio-workflow.js';
import { resetWorkflowSessions } from '../src/workflows/session-store.js';

function registerTool() {
  let handler;
  const server = {
    registerTool(_name, _config, registeredHandler) {
      handler = registeredHandler;
    }
  };
  registerPortfolioWorkflowTool(server);
  return handler;
}

function parseToolResponse(response) {
  return JSON.parse(response.content[0].text);
}

test('portfolio-workflow requires sessionToken for session reads', async () => {
  resetWorkflowSessions();
  const handler = registerTool();

  const created = parseToolResponse(await handler({
    intent: 'create-session',
    workflow: 'fetcher-to-reporter',
    scopeId: 'scope-a',
    input: { organizationId: 'org-1' }
  }));

  await assert.rejects(
    () => handler({ intent: 'get-session', sessionId: created.session.sessionId, scopeId: 'scope-a' }),
    (error) => error.code === -32602 && /sessionToken is required/.test(error.message)
  );

  const fetched = parseToolResponse(await handler({
    intent: 'get-session',
    sessionId: created.session.sessionId,
    sessionToken: created.session.sessionToken,
    scopeId: 'scope-a'
  }));

  assert.equal(fetched.session.sessionId, created.session.sessionId);
  assert.equal(fetched.session.sessionToken, undefined);
});

test('portfolio-workflow requires sessionToken for session listing', async () => {
  resetWorkflowSessions();
  const handler = registerTool();

  const created = parseToolResponse(await handler({
    intent: 'create-session',
    workflow: 'fetcher-to-reporter',
    scopeId: 'scope-list',
    input: { organizationId: 'org-1' }
  }));

  await assert.rejects(
    () => handler({ intent: 'list-sessions', scopeId: 'scope-list' }),
    (error) => error.code === -32602 && /sessionToken is required/.test(error.message)
  );

  const listed = parseToolResponse(await handler({
    intent: 'list-sessions',
    scopeId: 'scope-list',
    sessionToken: created.session.sessionToken
  }));

  assert.equal(listed.sessions.length, 1);
  assert.equal(listed.sessions[0].sessionId, created.session.sessionId);
});

test('portfolio-workflow plan previews session input without mutating persisted context', async () => {
  resetWorkflowSessions();
  const handler = registerTool();

  const created = parseToolResponse(await handler({
    intent: 'create-session',
    workflow: 'fetcher-to-reporter',
    scopeId: 'scope-plan',
    input: { organizationId: 'org-1' }
  }));

  await handler({
    intent: 'plan',
    sessionId: created.session.sessionId,
    sessionToken: created.session.sessionToken,
    scopeId: 'scope-plan',
    input: { mappedFields: [{ source: 'a', target: 'b' }] }
  });

  const fetched = parseToolResponse(await handler({
    intent: 'get-session',
    sessionId: created.session.sessionId,
    sessionToken: created.session.sessionToken,
    scopeId: 'scope-plan'
  }));

  assert.equal(fetched.session.inputContext.organizationId, 'org-1');
  assert.equal(fetched.session.inputContext.mappedFields, undefined);
});

test('portfolio-workflow rejects immutable context overrides before downstream execution', async () => {
  resetWorkflowSessions();
  const handler = registerTool();
  let fetchCalled = false;
  const previousFetch = global.fetch;

  try {
    global.fetch = async () => {
      fetchCalled = true;
      return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
    };

    const created = parseToolResponse(await handler({
      intent: 'create-session',
      workflow: 'fetcher-to-reporter',
      scopeId: 'scope-exec',
      input: { organizationId: 'org-1' }
    }));

    await assert.rejects(
      () => handler({
        intent: 'execute-step',
        sessionId: created.session.sessionId,
        sessionToken: created.session.sessionToken,
        scopeId: 'scope-exec',
        step: 'validate-fetcher-schema',
        input: {
          organizationId: 'org-2',
          mappedFields: [{ source: 'a', target: 'b' }],
          confirmMutation: true,
          mutationReason: 'test immutable override'
        }
      }),
      (error) => error.code === -32602 && /Cannot override immutable workflow session field/.test(error.message)
    );

    assert.equal(fetchCalled, false);
  } finally {
    global.fetch = previousFetch;
  }
});

test('portfolio-workflow validates step names before execution', async () => {
  resetWorkflowSessions();
  const handler = registerTool();

  await assert.rejects(
    () => handler({
      intent: 'execute-step',
      workflow: 'fetcher-to-reporter',
      step: 'missing-step',
      input: {}
    }),
    (error) => error.code === -32602 && /Unknown workflow step/.test(error.message)
  );
});
