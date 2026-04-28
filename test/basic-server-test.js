#!/usr/bin/env node

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.join(__dirname, '../dist/index.js');

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: path.join(__dirname, '..'),
    stderr: 'pipe',
    env: {
      NODE_ENV: 'test',
      LERIAN_CONSOLE_LOGS: 'false'
    }
  });

  const stderrChunks = [];
  transport.stderr?.on('data', (chunk) => stderrChunks.push(chunk.toString()));

  const client = new Client({ name: 'lerian-smoke-test', version: '1.0.0' });

  try {
    await client.connect(transport);

    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);
    for (const expected of ['lerian', 'portfolio-workflow', 'midaz-discover', 'midaz-execute', 'fetcher-discover', 'fetcher-execute']) {
      assert.ok(toolNames.includes(expected), `Expected tool ${expected} to be registered`);
    }

    const prompts = await client.listPrompts();
    assert.ok(prompts.prompts.length > 0, 'Expected prompts to be registered');

    const portfolio = await client.callTool({
      name: 'lerian',
      arguments: { product: 'all', operation: 'discover' }
    });
    assert.equal(portfolio.isError, false);
    assert.match(portfolio.content[0].text, /Lerian/);

    const midazDiscovery = await client.callTool({
      name: 'midaz-discover',
      arguments: { intent: 'list-resources' }
    });
    assert.equal(midazDiscovery.isError, false);
    assert.match(midazDiscovery.content[0].text, /totalResources/);

    const workflows = await client.callTool({
      name: 'portfolio-workflow',
      arguments: { intent: 'list-workflows' }
    });
    assert.equal(workflows.isError, false);
    assert.match(workflows.content[0].text, /fetcher-to-reporter/);
  } finally {
    await client.close();
  }

  if (stderrChunks.join('').includes('Fatal error')) {
    throw new Error(`Server stderr included fatal output: ${stderrChunks.join('')}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
