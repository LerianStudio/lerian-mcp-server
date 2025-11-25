import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'test-server',
  version: '1.0.0'
});

console.log('Testing prompt registration patterns...\n');

// Test 1: WRONG - z.object({}) as third parameter
try {
  server.prompt('test-empty-wrong', 'Wrong: z.object({})', z.object({}), async () => {
    return { messages: [] };
  });
  console.log('❌ UNEXPECTED: z.object({}) worked (should fail)');
} catch (error) {
  console.log('✅ EXPECTED: z.object({}) failed:', error.message);
}

// Test 2: CORRECT - No schema for zero-argument prompts (3-param version)
try {
  server.prompt('test-no-args', 'Correct: no schema', async () => {
    return { messages: [] };
  });
  console.log('✅ Zero-argument prompt (3 params) works');
} catch (error) {
  console.error('❌ Zero-argument prompt failed:', error.message);
}

// Test 3: CORRECT - Raw shape object (not z.object)
try {
  server.prompt('test-raw-shape', 'Correct: raw shape', {
    name: z.string().optional(),
    count: z.number().optional()
  }, async () => {
    return { messages: [] };
  });
  console.log('✅ Raw shape object works');
} catch (error) {
  console.error('❌ Raw shape object failed:', error.message);
}

// Test 4: CORRECT - Empty raw shape object {}
try {
  server.prompt('test-empty-shape', 'Correct: empty raw shape', {}, async () => {
    return { messages: [] };
  });
  console.log('✅ Empty raw shape {} works');
} catch (error) {
  console.error('❌ Empty raw shape failed:', error.message);
}

// Test 5: WRONG - z.object() with properties
try {
  server.prompt('test-zod-object-wrong', 'Wrong: z.object with props', z.object({
    value: z.string()
  }), async () => {
    return { messages: [] };
  });
  console.log('❌ UNEXPECTED: z.object() with props worked');
} catch (error) {
  console.log('✅ EXPECTED: z.object() with props failed:', error.message);
}

console.log('\n--- Summary ---');
console.log('CORRECT patterns:');
console.log('1. Zero args: server.prompt(name, description, callback)');
console.log('2. With args: server.prompt(name, description, {arg: z.string()}, callback)');
console.log('3. Empty args: server.prompt(name, description, {}, callback)');
console.log('\nWRONG pattern:');
console.log('✗ server.prompt(name, description, z.object({...}), callback)');
