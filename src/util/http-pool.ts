/**
 * HTTP Connection Pooling
 * Improves performance by reusing connections
 */

import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import fetch, { RequestInit, Response } from 'node-fetch';

/**
 * HTTP agent with connection pooling
 */
export const httpAgent = new HttpAgent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  keepAliveMsecs: 1000
});

/**
 * HTTPS agent with connection pooling
 */
export const httpsAgent = new HttpsAgent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  keepAliveMsecs: 1000
});

/**
 * Request deduplication map
 * Prevents duplicate concurrent requests
 */
const pendingRequests = new Map<string, Promise<Response>>();

/**
 * Generate cache key for request
 */
function generateRequestKey(url: string, options: RequestInit = {}): string {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${url}:${body}`;
}

/**
 * Fetch with connection pooling and request deduplication
 */
export async function fetchWithPool(url: string, options: RequestInit = {}): Promise<Response> {
  const agent = url.startsWith('https') ? httpsAgent : httpAgent;
  
  const fetchOptions: RequestInit = {
    ...options,
    agent
  };
  
  if (!options.method || options.method === 'GET') {
    const key = generateRequestKey(url, options);
    
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key)!;
    }
    
    const promise = fetch(url, fetchOptions);
    pendingRequests.set(key, promise);
    
    try {
      const response = await promise;
      return response;
    } finally {
      pendingRequests.delete(key);
    }
  }
  
  return fetch(url, fetchOptions);
}

/**
 * Clear all pending requests
 * Useful for testing or cleanup
 */
export function clearPendingRequests(): void {
  pendingRequests.clear();
}

/**
 * Get number of pending requests
 */
export function getPendingRequestCount(): number {
  return pendingRequests.size;
}

/**
 * Destroy agents and close all connections
 * Call this on shutdown
 */
export function destroyAgents(): void {
  httpAgent.destroy();
  httpsAgent.destroy();
  pendingRequests.clear();
}
