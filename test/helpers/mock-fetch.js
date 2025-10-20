/**
 * Mock fetch for testing HTTP requests
 */

export class MockFetch {
  constructor() {
    this.responses = new Map();
    this.calls = [];
  }

  /**
   * Set a mock response for a URL
   */
  mockResponse(url, response) {
    this.responses.set(url, response);
  }

  /**
   * Mock implementation of fetch
   */
  async fetch(url, options = {}) {
    this.calls.push({ url, options });

    const mockResponse = this.responses.get(url);
    if (!mockResponse) {
      return {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map(),
        json: async () => ({ error: 'Not found' }),
        text: async () => 'Not found'
      };
    }

    return {
      ok: mockResponse.status >= 200 && mockResponse.status < 300,
      status: mockResponse.status || 200,
      statusText: mockResponse.statusText || 'OK',
      headers: new Map(Object.entries(mockResponse.headers || {})),
      json: async () => mockResponse.body,
      text: async () => JSON.stringify(mockResponse.body)
    };
  }

  /**
   * Get all fetch calls
   */
  getCalls() {
    return this.calls;
  }

  /**
   * Clear all mocks
   */
  clear() {
    this.responses.clear();
    this.calls = [];
  }
}

export function createMockFetch() {
  return new MockFetch();
}
