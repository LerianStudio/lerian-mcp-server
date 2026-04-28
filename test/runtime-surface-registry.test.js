import test from 'node:test';
import assert from 'node:assert/strict';

import { getRuntimeSurface, listRuntimeToolMetadata, listLiveApiPairs } from '../src/runtime/surface-registry.js';
import { registerLerianTool } from '../src/tools/lerian.js';
import { registerPortfolioWorkflowTool } from '../src/tools/portfolio-workflow.js';
import { registerProductAdapters } from '../src/products/index.js';
import { registerDiscoveryPrompts } from '../src/prompts/tool-discovery.js';
import { registerWorkflowPrompts } from '../src/prompts/midaz-workflows.js';
import { registerAdvancedPrompts } from '../src/prompts/advanced-workflows.js';

test('runtime surface registry stays internally consistent', () => {
  const surface = getRuntimeSurface();

  assert.equal(surface.toolCount, surface.tools.length);
  assert.equal(surface.promptCount, surface.prompts.length);
  assert.equal(surface.workflowCount, surface.workflows.length);
});

test('runtime surface includes workflow tool plus live adapters across the expanded portfolio', () => {
  const toolNames = listRuntimeToolMetadata().map((tool) => tool.name).sort();

  assert.deepEqual(toolNames, [
    'fetcher-discover',
    'fetcher-execute',
    'flowker-discover',
    'flowker-execute',
    'lerian',
    'matcher-discover',
    'matcher-execute',
    'midaz-discover',
    'midaz-execute',
    'portfolio-workflow',
    'reporter-discover',
    'reporter-execute',
    'tracer-discover',
    'tracer-execute',
    'underwriter-discover',
    'underwriter-execute'
  ]);
});

test('runtime surface exposes live API pairs for all current live products', () => {
  const pairs = listLiveApiPairs();
  const byProduct = Object.fromEntries(pairs.map((pair) => [pair.product, pair]));

  assert.deepEqual(Object.keys(byProduct).sort(), ['fetcher', 'flowker', 'matcher', 'midaz', 'reporter', 'tracer', 'underwriter']);
  assert.equal(byProduct.midaz.discover, 'midaz-discover');
  assert.equal(byProduct.midaz.execute, 'midaz-execute');
  assert.equal(byProduct.fetcher.discover, 'fetcher-discover');
  assert.equal(byProduct.fetcher.execute, 'fetcher-execute');
  assert.equal(byProduct.reporter.discover, 'reporter-discover');
  assert.equal(byProduct.reporter.execute, 'reporter-execute');
  assert.equal(byProduct.matcher.discover, 'matcher-discover');
  assert.equal(byProduct.matcher.execute, 'matcher-execute');
  assert.equal(byProduct.tracer.discover, 'tracer-discover');
  assert.equal(byProduct.tracer.execute, 'tracer-execute');
  assert.equal(byProduct.flowker.discover, 'flowker-discover');
  assert.equal(byProduct.flowker.execute, 'flowker-execute');
  assert.equal(byProduct.underwriter.discover, 'underwriter-discover');
  assert.equal(byProduct.underwriter.execute, 'underwriter-execute');
});

test('runtime surface exposes both cross-product workflows', () => {
  const surface = getRuntimeSurface();
  const workflowIds = surface.workflows.map((workflow) => workflow.id);

  assert.ok(workflowIds.includes('fetcher-to-reporter'));
  assert.ok(workflowIds.includes('matcher-to-fetcher-to-midaz'));
});

test('runtime metadata matches actual tool and prompt registration', () => {
  const registeredTools = [];
  const registeredPrompts = [];
  const fakeServer = {
    registerTool(name) {
      registeredTools.push(name);
    },
    registerPrompt(name) {
      registeredPrompts.push(name);
    }
  };

  registerLerianTool(fakeServer);
  registerPortfolioWorkflowTool(fakeServer);
  registerProductAdapters(fakeServer);
  registerDiscoveryPrompts(fakeServer);
  registerWorkflowPrompts(fakeServer);
  registerAdvancedPrompts(fakeServer);

  const surface = getRuntimeSurface();
  assert.deepEqual(registeredTools.sort(), surface.tools.map((tool) => tool.name).sort());
  assert.deepEqual(registeredPrompts.sort(), surface.prompts.map((prompt) => prompt.name).sort());
});
