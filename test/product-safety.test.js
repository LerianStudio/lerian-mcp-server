import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildUrl,
  createApiError,
  decodeUploadContent,
  sanitizeCustomHeaders,
  validateActionRequest
} from '../src/products/http-helpers.js';

test('product header sanitizer prevents caller auth override and keeps allowlisted headers', () => {
  const sanitized = sanitizeCustomHeaders({
    Authorization: 'Bearer attacker',
    'X-API-Key': 'attacker-key',
    'Idempotency-Key': 'idem-1',
    'X-Webhook-Token': 'webhook-1',
    'X-Unlisted': 'drop-me'
  }, {
    Authorization: { required: false },
    'X-API-Key': { required: false },
    'Idempotency-Key': { required: false },
    'X-Webhook-Token': { required: false }
  });

  assert.deepEqual(sanitized, {
    'Idempotency-Key': 'idem-1',
    'X-Webhook-Token': 'webhook-1'
  });
});

test('raw path parameters preserve safe nested segments but reject traversal', () => {
  assert.equal(
    buildUrl('http://localhost:4021', '/v1/webhooks/:path', { path: 'payments/kyc/callback' }, ['path']),
    'http://localhost:4021/v1/webhooks/payments/kyc/callback'
  );

  assert.throws(
    () => buildUrl('http://localhost:4021', '/v1/webhooks/:path', { path: '../admin' }, ['path']),
    /unsafe path segment/
  );
});

test('action validation enforces required inputs and mutation confirmation', () => {
  const action = {
    resource: 'reports',
    action: 'create',
    method: 'POST',
    input: {
      templateId: { required: true },
      filters: { required: true }
    }
  };

  assert.throws(
    () => validateActionRequest(action, { body: { templateId: 'template-1' }, confirmMutation: true, mutationReason: 'test' }),
    /Missing required body fields: filters/
  );

  assert.throws(
    () => validateActionRequest(action, { body: { templateId: 'template-1', filters: {} } }),
    /confirmMutation=true is required/
  );
});

test('API errors redact secrets and query strings', () => {
  const response = new Response(JSON.stringify({ ok: false }), {
    status: 400,
    statusText: 'Bad Request',
    headers: { 'content-type': 'application/json' }
  });

  const error = createApiError('Reporter', response, {
    token: 'secret-token',
    nested: { password: 'secret-password', safe: 'visible' }
  }, 'https://api.example.com/v1/reports?access_token=secret');

  assert.equal(error.url, '/v1/reports?[redacted]');
  assert.equal(error.body.token, '[redacted]');
  assert.equal(error.body.nested.password, '[redacted]');
  assert.equal(error.body.nested.safe, 'visible');
});

test('multipart upload decoder enforces byte limits', () => {
  assert.throws(
    () => decodeUploadContent({ filename: 'template.tpl', content: 'too-large' }, 3),
    /exceeds the configured 3 byte limit/
  );
});
