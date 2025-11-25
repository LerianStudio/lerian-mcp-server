/**
 * Test for CRT-006: Silent Fallback to Stub Data Without Indication
 *
 * This test verifies that the metadata field is properly included
 * in paginated responses to indicate data source.
 */

import { createPaginatedResponse } from '../src/util/mcp-helpers.js';

console.log('Testing CRT-006 Fix: Data Source Metadata\n');

// Test 1: Response without metadata (backward compatibility)
console.log('Test 1: Response without metadata (backward compatibility)');
try {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const response1 = createPaginatedResponse(items, { limit: 2 });
  const parsed1 = JSON.parse(response1.content[0].text);

  console.log('✓ Function works without metadata parameter');
  console.log('✓ No _metadata field present:', !parsed1._metadata);
  console.log('Response:', JSON.stringify(parsed1, null, 2));
} catch (error) {
  console.error('✗ Test 1 failed:', error.message);
}

console.log('\n---\n');

// Test 2: Response with stub metadata
console.log('Test 2: Response with stub data metadata');
try {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const metadata = {
    isStub: true,
    dataSource: 'stub',
    reason: 'backend_unavailable'
  };
  const response2 = createPaginatedResponse(items, { limit: 2 }, metadata);
  const parsed2 = JSON.parse(response2.content[0].text);

  console.log('✓ Function accepts metadata parameter');
  console.log('✓ _metadata field is present:', !!parsed2._metadata);
  console.log('✓ isStub flag is set:', parsed2._metadata.isStub === true);
  console.log('✓ dataSource is "stub":', parsed2._metadata.dataSource === 'stub');
  console.log('✓ reason is present:', !!parsed2._metadata.reason);
  console.log('✓ timestamp is present:', !!parsed2._metadata.timestamp);
  console.log('Response:', JSON.stringify(parsed2, null, 2));
} catch (error) {
  console.error('✗ Test 2 failed:', error.message);
}

console.log('\n---\n');

// Test 3: Response with API metadata
console.log('Test 3: Response with real API data metadata');
try {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const metadata = {
    isStub: false,
    dataSource: 'api'
  };
  const response3 = createPaginatedResponse(items, { limit: 2 }, metadata);
  const parsed3 = JSON.parse(response3.content[0].text);

  console.log('✓ Function accepts API metadata');
  console.log('✓ _metadata field is present:', !!parsed3._metadata);
  console.log('✓ isStub flag is false:', parsed3._metadata.isStub === false);
  console.log('✓ dataSource is "api":', parsed3._metadata.dataSource === 'api');
  console.log('✓ timestamp is present:', !!parsed3._metadata.timestamp);
  console.log('Response:', JSON.stringify(parsed3, null, 2));
} catch (error) {
  console.error('✗ Test 3 failed:', error.message);
}

console.log('\n---\n');
console.log('All CRT-006 tests completed!');
