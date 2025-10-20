/**
 * Unit tests for security.js
 * Target coverage: 95%
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isLocalConnection,
  sanitizeSensitiveData,
  createAuditLog,
  auditToolInvocation,
  auditResourceAccess,
  validateInput,
  checkRateLimit
} from '../../src/util/security.js';
import { z } from 'zod';
import { maliciousInputs } from '../fixtures/test-data.js';

describe('Security Module', () => {
  describe('isLocalConnection', () => {
    it('should return true for stdio transport (no request)', () => {
      expect(isLocalConnection(null)).toBe(true);
      expect(isLocalConnection(undefined)).toBe(true);
      expect(isLocalConnection({})).toBe(true);
    });

    it('should return true for localhost connections', () => {
      const request = {
        headers: { host: 'localhost:3000' },
        socket: { remoteAddress: '127.0.0.1' }
      };
      expect(isLocalConnection(request)).toBe(true);
    });

    it('should return true for IPv6 localhost', () => {
      const request = {
        headers: { host: 'localhost' },
        socket: { remoteAddress: '::1' }
      };
      expect(isLocalConnection(request)).toBe(true);
    });

    it('should return true for IPv4-mapped IPv6 localhost', () => {
      const request = {
        headers: { host: 'localhost' },
        socket: { remoteAddress: '::ffff:127.0.0.1' }
      };
      expect(isLocalConnection(request)).toBe(true);
    });

    it('should return false for non-localhost host', () => {
      const request = {
        headers: { host: 'example.com' },
        socket: { remoteAddress: '192.168.1.1' }
      };
      expect(isLocalConnection(request)).toBe(false);
    });

    it('should return false for remote IP address', () => {
      const request = {
        headers: { host: 'localhost' },
        socket: { remoteAddress: '192.168.1.1' }
      };
      expect(isLocalConnection(request)).toBe(false);
    });
  });

  describe('sanitizeSensitiveData', () => {
    it('should redact password fields', () => {
      const data = { username: 'test', password: 'secret123' };
      const sanitized = sanitizeSensitiveData(data);
      expect(sanitized.username).toBe('test');
      expect(sanitized.password).toBe('[REDACTED]');
    });

    it('should redact token fields', () => {
      const data = { userId: '123', accessToken: 'abc123' };
      const sanitized = sanitizeSensitiveData(data);
      expect(sanitized.userId).toBe('123');
      expect(sanitized.accessToken).toBe('[REDACTED]');
    });

    it('should redact secret fields', () => {
      const data = { config: 'value', clientSecret: 'secret' };
      const sanitized = sanitizeSensitiveData(data);
      expect(sanitized.config).toBe('value');
      expect(sanitized.clientSecret).toBe('[REDACTED]');
    });

    it('should redact apiKey fields', () => {
      const data = { name: 'test', apiKey: 'key123' };
      const sanitized = sanitizeSensitiveData(data);
      expect(sanitized.name).toBe('test');
      expect(sanitized.apiKey).toBe('[REDACTED]');
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          name: 'test',
          credentials: {
            password: 'secret',
            token: 'abc123'
          }
        }
      };
      const sanitized = sanitizeSensitiveData(data);
      expect(sanitized.user.name).toBe('test');
      expect(sanitized.user.credentials.password).toBe('[REDACTED]');
      expect(sanitized.user.credentials.token).toBe('[REDACTED]');
    });

    it('should handle arrays', () => {
      const data = {
        users: [
          { name: 'user1', password: 'pass1' },
          { name: 'user2', password: 'pass2' }
        ]
      };
      const sanitized = sanitizeSensitiveData(data);
      expect(sanitized.users[0].name).toBe('user1');
      expect(sanitized.users[0].password).toBe('[REDACTED]');
      expect(sanitized.users[1].name).toBe('user2');
      expect(sanitized.users[1].password).toBe('[REDACTED]');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeSensitiveData(null)).toBe(null);
      expect(sanitizeSensitiveData(undefined)).toBe(undefined);
    });

    it('should handle primitive types', () => {
      expect(sanitizeSensitiveData('string')).toBe('string');
      expect(sanitizeSensitiveData(123)).toBe(123);
      expect(sanitizeSensitiveData(true)).toBe(true);
    });

    it('should prevent infinite recursion', () => {
      const circular = { a: 1 };
      circular.self = circular;
      const sanitized = sanitizeSensitiveData(circular);
      expect(sanitized.a).toBe(1);
    });

    it('should be case-insensitive for sensitive fields', () => {
      const data = {
        PASSWORD: 'secret',
        Token: 'abc',
        ApiKey: 'key'
      };
      const sanitized = sanitizeSensitiveData(data);
      expect(sanitized.PASSWORD).toBe('[REDACTED]');
      expect(sanitized.Token).toBe('[REDACTED]');
      expect(sanitized.ApiKey).toBe('[REDACTED]');
    });
  });

  describe('validateInput', () => {
    it('should validate correct input', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });
      const data = { name: 'John', age: 30 };
      const result = validateInput(schema, data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should reject invalid input', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });
      const data = { name: 'John', age: 'thirty' };
      const result = validateInput(schema, data);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject SQL injection patterns', () => {
      const schema = z.object({
        query: z.string()
      });
      const data = { query: maliciousInputs.sqlInjection };
      const result = validateInput(schema, data);
      expect(result.success).toBe(false);
      expect(result.error).toContain('injection');
    });

    it('should reject XSS patterns', () => {
      const schema = z.object({
        content: z.string()
      });
      const data = { content: maliciousInputs.xss };
      const result = validateInput(schema, data);
      expect(result.success).toBe(false);
      expect(result.error).toContain('injection');
    });

    it('should reject path traversal patterns', () => {
      const schema = z.object({
        path: z.string()
      });
      const data = { path: maliciousInputs.pathTraversal };
      const result = validateInput(schema, data);
      expect(result.success).toBe(false);
      expect(result.error).toContain('injection');
    });

    it('should reject oversized requests', () => {
      const schema = z.object({
        data: z.string()
      });
      const data = { data: 'A'.repeat(2 * 1024 * 1024) }; // 2MB
      const result = validateInput(schema, data);
      expect(result.success).toBe(false);
      expect(result.error).toContain('size');
    });

    it('should handle nested validation', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email()
        })
      });
      const data = {
        user: {
          name: 'John',
          email: 'invalid-email'
        }
      };
      const result = validateInput(schema, data);
      expect(result.success).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should allow requests within limit', () => {
      const identifier = 'test-user-1';
      for (let i = 0; i < 100; i++) {
        expect(checkRateLimit(identifier, 100, 60000)).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user-2';
      for (let i = 0; i < 100; i++) {
        checkRateLimit(identifier, 100, 60000);
      }
      expect(checkRateLimit(identifier, 100, 60000)).toBe(false);
    });

    it('should reset after time window', () => {
      const identifier = 'test-user-3';
      for (let i = 0; i < 100; i++) {
        checkRateLimit(identifier, 100, 60000);
      }
      expect(checkRateLimit(identifier, 100, 60000)).toBe(false);
      
      vi.advanceTimersByTime(61000);
      
      expect(checkRateLimit(identifier, 100, 60000)).toBe(true);
    });

    it('should track different identifiers separately', () => {
      const id1 = 'user-1';
      const id2 = 'user-2';
      
      for (let i = 0; i < 100; i++) {
        checkRateLimit(id1, 100, 60000);
      }
      
      expect(checkRateLimit(id1, 100, 60000)).toBe(false);
      expect(checkRateLimit(id2, 100, 60000)).toBe(true);
    });

    it('should handle custom limits', () => {
      const identifier = 'test-user-4';
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(identifier, 10, 60000)).toBe(true);
      }
      expect(checkRateLimit(identifier, 10, 60000)).toBe(false);
    });

    it('should handle custom time windows', () => {
      const identifier = 'test-user-5';
      for (let i = 0; i < 50; i++) {
        checkRateLimit(identifier, 50, 30000);
      }
      expect(checkRateLimit(identifier, 50, 30000)).toBe(false);
      
      vi.advanceTimersByTime(31000);
      
      expect(checkRateLimit(identifier, 50, 30000)).toBe(true);
    });
  });

  describe('auditToolInvocation', () => {
    it('should create audit log for successful invocation', () => {
      const log = auditToolInvocation(
        'test-tool',
        { arg1: 'value1' },
        'user-123',
        { result: 'success' },
        null
      );
      
      if (log) {
        expect(log.type).toBe('tool_invocation');
        expect(log.tool).toBe('test-tool');
        expect(log.user).toBe('user-123');
        expect(log.success).toBe(true);
        expect(log.error).toBe(null);
      }
    });

    it('should create audit log for failed invocation', () => {
      const error = new Error('Test error');
      const log = auditToolInvocation(
        'test-tool',
        { arg1: 'value1' },
        'user-123',
        null,
        error
      );
      
      if (log) {
        expect(log.type).toBe('tool_invocation');
        expect(log.success).toBe(false);
        expect(log.error).toBe('Test error');
      }
    });

    it('should sanitize sensitive data in args', () => {
      const log = auditToolInvocation(
        'test-tool',
        { username: 'test', password: 'secret' },
        'user-123',
        null,
        null
      );
      
      if (log) {
        expect(log.args.password).toBe('[REDACTED]');
      }
    });
  });

  describe('auditResourceAccess', () => {
    it('should create audit log for successful access', () => {
      const log = auditResourceAccess(
        'resource://test',
        'user-123',
        true,
        null
      );
      
      if (log) {
        expect(log.type).toBe('resource_access');
        expect(log.resource).toBe('resource://test');
        expect(log.user).toBe('user-123');
        expect(log.success).toBe(true);
      }
    });

    it('should create audit log for failed access', () => {
      const error = new Error('Access denied');
      const log = auditResourceAccess(
        'resource://test',
        'user-123',
        false,
        error
      );
      
      if (log) {
        expect(log.type).toBe('resource_access');
        expect(log.success).toBe(false);
        expect(log.error).toBe('Access denied');
      }
    });
  });
});
