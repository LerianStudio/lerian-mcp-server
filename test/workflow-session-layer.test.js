import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createWorkflowSession,
  getWorkflowSession,
  listWorkflowSessions,
  mergeWorkflowSessionInput,
  previewWorkflowSessionInput,
  recordWorkflowStep,
  resetWorkflowSessions
} from '../src/workflows/session-store.js';
import { getWorkflow, listWorkflows } from '../src/workflows/index.js';

test('workflow registry exposes both implemented workflows', () => {
  const workflows = listWorkflows();
  const ids = workflows.map((workflow) => workflow.id);

  assert.ok(ids.includes('fetcher-to-reporter'));
  assert.ok(ids.includes('matcher-to-fetcher-to-midaz'));
});

test('workflow session store creates, merges, and records stateful progress', () => {
  resetWorkflowSessions();

  const session = createWorkflowSession('matcher-to-fetcher-to-midaz', {
    organizationId: 'org-1'
  }, { scopeId: 'test-scope' });

  assert.equal(session.workflowId, 'matcher-to-fetcher-to-midaz');
  assert.equal(typeof session.sessionToken, 'string');
  assert.equal(session.inputContext.organizationId, 'org-1');
  assert.deepEqual(session.completedSteps, []);

  const merged = mergeWorkflowSessionInput(session.sessionId, {
    ledgerId: 'ledger-1'
  }, { scopeId: 'test-scope', sessionToken: session.sessionToken });

  assert.equal(merged.inputContext.organizationId, 'org-1');
  assert.equal(merged.inputContext.ledgerId, 'ledger-1');

  const recorded = recordWorkflowStep(session.sessionId, {
    step: 'create-matcher-context',
    input: { context: { name: 'Q1 Recon' } },
    result: { id: 'ctx-1' },
    artifacts: { contextId: 'ctx-1' }
  }, { scopeId: 'test-scope', sessionToken: session.sessionToken });

  assert.ok(recorded.completedSteps.includes('create-matcher-context'));
  assert.equal(recorded.artifacts.contextId, 'ctx-1');
  assert.equal(recorded.inputContext.contextId, 'ctx-1');
  assert.equal(recorded.stepHistory.length, 1);

  const fetched = getWorkflowSession(session.sessionId, { scopeId: 'test-scope', sessionToken: session.sessionToken });
  assert.equal(fetched.artifacts.contextId, 'ctx-1');
  assert.equal(fetched.sessionToken, undefined);

  const listed = listWorkflowSessions('matcher-to-fetcher-to-midaz', { scopeId: 'test-scope', sessionToken: session.sessionToken });
  assert.equal(listed.length, 1);
  assert.equal(listed[0].stepHistoryCount, 1);
  assert.equal(listed[0].inputContext, undefined);
});

test('workflow session store enforces scope isolation', () => {
  resetWorkflowSessions();

  const session = createWorkflowSession('fetcher-to-reporter', {}, { scopeId: 'owner-a' });

  assert.equal(getWorkflowSession(session.sessionId, { scopeId: 'owner-b' }), null);
  assert.equal(getWorkflowSession(session.sessionId, { scopeId: 'owner-a', sessionToken: 'wrong-token' }), null);
  assert.deepEqual(listWorkflowSessions(null, { scopeId: 'owner-b', sessionToken: session.sessionToken }), []);
  assert.deepEqual(listWorkflowSessions(null, { scopeId: 'owner-a', sessionToken: 'wrong-token' }), []);
});

test('workflow session store redacts sensitive state and blocks immutable scope overrides', () => {
  resetWorkflowSessions();

  const session = createWorkflowSession('matcher-to-fetcher-to-midaz', {
    organizationId: 'org-1',
    Authorization: 'Bearer secret',
    nested: { password: 'secret-password' }
  }, { scopeId: 'tenant-a' });

  assert.equal(session.inputContext.Authorization, '[redacted]');
  assert.equal(session.inputContext.nested.password, '[redacted]');

  assert.throws(
    () => mergeWorkflowSessionInput(session.sessionId, { organizationId: 'org-2' }, { scopeId: 'tenant-a', sessionToken: session.sessionToken }),
    /Cannot override immutable workflow session field "organizationId"/
  );

  assert.throws(
    () => previewWorkflowSessionInput(session.sessionId, { organizationId: 'org-2' }, { scopeId: 'tenant-a', sessionToken: session.sessionToken }),
    /Cannot override immutable workflow session field "organizationId"/
  );

  assert.equal(getWorkflowSession(session.sessionId, { scopeId: 'tenant-a', sessionToken: session.sessionToken }).inputContext.organizationId, 'org-1');
});

test('matcher workflow plan reports missing input for first unresolved steps', () => {
  const workflow = getWorkflow('matcher-to-fetcher-to-midaz');
  const plan = workflow.plan({});

  const createContextStep = plan.steps.find((step) => step.step === 'create-matcher-context');
  const refreshStep = plan.steps.find((step) => step.step === 'refresh-matcher-discovery');

  assert.equal(createContextStep.ready, false);
  assert.deepEqual(createContextStep.missingInput, ['context']);
  assert.equal(refreshStep.ready, true);
  assert.deepEqual(refreshStep.missingInput, []);
});

test('workflow artifact capture keeps important IDs for follow-up steps', () => {
  const matcherWorkflow = getWorkflow('matcher-to-fetcher-to-midaz');
  const reporterWorkflow = getWorkflow('fetcher-to-reporter');

  const matcherArtifacts = matcherWorkflow.captureArtifacts(
    'start-matcher-discovery-extraction',
    { id: 'extraction-1', fetcherJobId: 'fetcher-job-1' },
    {}
  );

  assert.deepEqual(matcherArtifacts, {
    extractionId: 'extraction-1',
    fetcherJobId: 'fetcher-job-1'
  });

  const reporterArtifacts = reporterWorkflow.captureArtifacts(
    'create-reporter-report',
    { id: 'report-1' },
    {}
  );

  assert.deepEqual(reporterArtifacts, {
    reportId: 'report-1'
  });
});
