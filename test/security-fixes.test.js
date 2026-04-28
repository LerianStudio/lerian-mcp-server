import test from 'node:test';
import assert from 'node:assert/strict';

import { createSignedCursor, verifyAndDecodeCursor } from '../src/util/cursor-security.js';
import { createToolResponse, wrapToolHandler, createErrorResponse, ErrorCodes } from '../src/util/mcp-helpers.js';
import { validateActionRequest } from '../src/products/http-helpers.js';
import { webhooksSchema } from '../src/products/flowker/schemas/webhooks.js';

test('createToolResponse handles empty and non-JSON-safe values without crashing', () => {
  assert.deepEqual(createToolResponse(undefined).content[0].text, '');

  const cyclic = { ok: true };
  cyclic.self = cyclic;
  const response = createToolResponse(cyclic);

  assert.equal(response.isError, false);
  assert.match(response.content[0].text, /circular|serializationError/);
});

test('createToolResponse redacts sensitive keys and token-like values', () => {
  const response = createToolResponse({
    accessToken: 'secret-token',
    message: 'Authorization: Bearer eyJabc.def.ghi'
  });

  assert.match(response.content[0].text, /\[redacted\]/);
  assert.doesNotMatch(response.content[0].text, /secret-token/);
  assert.doesNotMatch(response.content[0].text, /eyJabc\.def\.ghi/);
  assert.equal(response.structuredContent.accessToken, '[redacted]');
});

test('wrapToolHandler preserves not-found errors when args are absent', async () => {
  const handler = wrapToolHandler(async () => {
    throw new Error('resource not found');
  });

  await assert.rejects(
    () => handler(undefined, {}),
    (error) => error.code === ErrorCodes.RESOURCE_NOT_FOUND && error.message === 'resource not found'
  );
});

test('createErrorResponse hides internal error detail data by default', () => {
  assert.throws(
    () => createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'An internal error occurred', { originalError: 'secret stack path' }),
    (error) => error.code === ErrorCodes.INTERNAL_ERROR && !('originalError' in (error.data || {}))
  );
});

test('signed cursors reject payload and signature tampering', () => {
  const cursor = createSignedCursor({ offset: 100 });
  const [payload, signature] = cursor.split('.');

  const tamperedPayload = Buffer.from(JSON.stringify({ offset: 9999 })).toString('base64');
  assert.throws(() => verifyAndDecodeCursor(`${tamperedPayload}.${signature}`), /Invalid cursor signature/);

  const tamperedSignature = `${signature.slice(0, -1)}${signature.endsWith('a') ? 'b' : 'a'}`;
  assert.throws(() => verifyAndDecodeCursor(`${payload}.${tamperedSignature}`), /Invalid cursor signature/);
});

test('Flowker webhooks accept direct freeform JSON bodies and still validate path/header contracts', () => {
  const action = webhooksSchema.actions.post;

  assert.doesNotThrow(() => validateActionRequest(action, {
    pathParams: { path: 'payments/kyc/callback' },
    headers: {},
    body: { event: 'kyc.approved', nested: { id: 'evt-1' } },
    confirmMutation: true,
    mutationReason: 'integration test'
  }));

  assert.throws(() => validateActionRequest(action, {
    pathParams: {},
    body: { event: 'kyc.approved' },
    confirmMutation: true,
    mutationReason: 'integration test'
  }), /Missing required path parameters: path/);
});
