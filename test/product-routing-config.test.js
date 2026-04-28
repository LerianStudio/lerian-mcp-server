import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseResponseBody, validateActionRequest } from '../src/products/http-helpers.js';
import { isResourceForProduct, getProductConfig, listProducts } from '../src/catalog/product-registry.js';
import { routeAndExecute as executeFetcher } from '../src/products/fetcher/router.js';
import { getAllSchemas as getMidazSchemas } from '../src/api/schemas/index.js';
import { resolveAction as resolveMidazAction } from '../src/api/router.js';
import { getAllSchemas as getFetcherSchemas } from '../src/products/fetcher/schemas/index.js';
import { resolveAction as resolveFetcherAction } from '../src/products/fetcher/router.js';
import { getAllSchemas as getReporterSchemas } from '../src/products/reporter/schemas/index.js';
import { resolveAction as resolveReporterAction } from '../src/products/reporter/router.js';
import { getAllSchemas as getMatcherSchemas } from '../src/products/matcher/schemas/index.js';
import { resolveAction as resolveMatcherAction } from '../src/products/matcher/router.js';
import { getAllSchemas as getTracerSchemas } from '../src/products/tracer/schemas/index.js';
import { resolveAction as resolveTracerAction } from '../src/products/tracer/router.js';
import { getAllSchemas as getFlowkerSchemas } from '../src/products/flowker/schemas/index.js';
import { resolveAction as resolveFlowkerAction } from '../src/products/flowker/router.js';
import { getAllSchemas as getUnderwriterSchemas } from '../src/products/underwriter/schemas/index.js';
import { resolveAction as resolveUnderwriterAction } from '../src/products/underwriter/router.js';

test('action validation rejects unknown fields, invalid types, and unsafe list limits', () => {
  const action = {
    resource: 'connections',
    action: 'list',
    method: 'GET',
    queryParams: {
      limit: { type: 'number', required: false },
      sortOrder: { type: 'string', required: false }
    }
  };

  assert.throws(
    () => validateActionRequest(action, { queryParams: { limit: '100' } }),
    /Invalid query parameters: limit must be number/
  );

  assert.throws(
    () => validateActionRequest(action, { queryParams: { unexpected: true } }),
    /Unknown query parameters: unexpected/
  );

  assert.throws(
    () => validateActionRequest(action, { queryParams: { limit: 5000 } }),
    /limit must be between 1 and 1000/
  );
});

test('response parsing enforces text and json download limits', async () => {
  const response = new Response(JSON.stringify({ items: ['too-large'] }), {
    headers: { 'content-type': 'application/json' }
  });

  await assert.rejects(
    () => parseResponseBody(response, { maxDownloadBytes: 4 }),
    /JSON response exceeds the configured 4 byte limit/
  );
});

test('response parsing rejects invalid successful JSON and preserves error previews', async () => {
  await assert.rejects(
    () => parseResponseBody(new Response('{broken', { headers: { 'content-type': 'application/json' } })),
    /Invalid JSON response/
  );

  const parsed = await parseResponseBody(new Response('{broken', {
    status: 502,
    headers: { 'content-type': 'application/json' }
  }));

  assert.equal(typeof parsed.parseError, 'string');
  assert.equal(parsed.rawBodyPreview, '{broken');
});

test('every product schema action resolves through its execute router', () => {
  const products = [
    { name: 'midaz', schemas: getMidazSchemas(), resolve: resolveMidazAction },
    { name: 'fetcher', schemas: getFetcherSchemas(), resolve: resolveFetcherAction },
    { name: 'reporter', schemas: getReporterSchemas(), resolve: resolveReporterAction },
    { name: 'matcher', schemas: getMatcherSchemas(), resolve: resolveMatcherAction },
    { name: 'tracer', schemas: getTracerSchemas(), resolve: resolveTracerAction },
    { name: 'flowker', schemas: getFlowkerSchemas(), resolve: resolveFlowkerAction },
    { name: 'underwriter', schemas: getUnderwriterSchemas(), resolve: resolveUnderwriterAction }
  ];

  for (const product of products) {
    for (const schema of product.schemas) {
      for (const actionName of Object.keys(schema.actions)) {
        const resolved = product.resolve(schema.resource, actionName);
        assert.equal(resolved.error, undefined, `${product.name}.${schema.resource}.${actionName} should resolve`);
        assert.equal(resolved.resource, schema.resource);
        assert.equal(resolved.action, actionName);
        assert.equal(resolved.method, schema.actions[actionName].method);
      }
    }
  }
});

test('matcher schema components cover all advertised live API areas', () => {
  const components = new Set(getMatcherSchemas().map((schema) => schema.component));

  for (const expected of ['configuration', 'discovery', 'matching', 'exceptions', 'governance', 'reporting', 'operations']) {
    assert.ok(components.has(expected), `Expected Matcher component ${expected}`);
  }
});

test('fetcher router executes a validated list action with configured headers', async () => {
  const previousFetch = global.fetch;
  try {
    global.fetch = async (url, options) => {
      assert.equal(url, 'http://localhost:4006/v1/management/connections?limit=10');
      assert.equal(options.headers['X-Organization-Id'], 'org-1');
      assert.equal(options.headers.Authorization, undefined);
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    };

    const result = await executeFetcher({
      resource: 'connections',
      action: 'list',
      organizationId: 'org-1',
      queryParams: { limit: 10 }
    });

    assert.deepEqual(result, { items: [] });
  } finally {
    global.fetch = previousFetch;
  }
});

test('config loader accepts --config and Lerian config file names', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lerian-config-test-'));
  const configPath = path.join(tempDir, 'lerian-mcp-config.json');
  fs.writeFileSync(configPath, JSON.stringify({ logLevel: 'debug', fetcherApi: { managerUrl: 'http://localhost:4999' } }));

  const previousArgv = process.argv;
  process.argv = ['node', 'test', '--config', configPath];
  try {
    const module = await import(`../src/config.js?config-test=${Date.now()}`);
    const config = await module.loadConfig();
    assert.equal(config.logLevel, 'debug');
    assert.equal(config.fetcherApi.managerUrl, 'http://localhost:4999');
    assert.equal(config._source, configPath);
  } finally {
    process.argv = previousArgv;
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('product registry returns cloned products and only authoritative product docs matches', () => {
  const products = listProducts();
  products[0].sdkLanguages.push('mutated');

  assert.equal(listProducts()[0].sdkLanguages.includes('mutated'), false);
  assert.equal(isResourceForProduct({ url: '/tracer/rules.md', title: 'Rules' }, getProductConfig('tracer')), true);
  assert.equal(isResourceForProduct({ title: 'Audit reports', category: 'reports' }, getProductConfig('tracer')), false);
});
