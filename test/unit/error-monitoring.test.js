/**
 * Unit tests for error-monitoring.js
 * Target coverage: 90%
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ErrorMonitor,
  ErrorSeverity,
  PerformanceThresholds,
  trackAsyncOperation,
  trackSyncOperation
} from '../../src/util/error-monitoring.js';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('Error Monitoring Module', () => {
  const testLogDir = './test-logs';

  beforeEach(() => {
    if (existsSync(testLogDir)) {
      rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (existsSync(testLogDir)) {
      rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  describe('ErrorSeverity', () => {
    it('should have correct severity levels', () => {
      expect(ErrorSeverity.LOW).toBe('low');
      expect(ErrorSeverity.MEDIUM).toBe('medium');
      expect(ErrorSeverity.HIGH).toBe('high');
      expect(ErrorSeverity.CRITICAL).toBe('critical');
    });
  });

  describe('PerformanceThresholds', () => {
    it('should have correct threshold values', () => {
      expect(PerformanceThresholds.FAST).toBe(100);
      expect(PerformanceThresholds.NORMAL).toBe(500);
      expect(PerformanceThresholds.SLOW).toBe(1000);
      expect(PerformanceThresholds.CRITICAL).toBe(3000);
    });
  });

  describe('ErrorMonitor', () => {
    describe('constructor', () => {
      it('should create instance with default options', () => {
        const monitor = new ErrorMonitor();
        expect(monitor.enabled).toBe(true);
        expect(monitor.logToFile).toBe(false);
        expect(monitor.performanceTracking).toBe(false);
        expect(monitor.logDirectory).toBe('./logs');
      });

      it('should create instance with custom options', () => {
        const monitor = new ErrorMonitor({
          enabled: false,
          logToFile: true,
          logDirectory: testLogDir,
          performanceTracking: true,
          maxLogFiles: 5,
          maxLogSize: 5 * 1024 * 1024
        });
        expect(monitor.enabled).toBe(false);
        expect(monitor.logToFile).toBe(true);
        expect(monitor.logDirectory).toBe(testLogDir);
        expect(monitor.performanceTracking).toBe(true);
        expect(monitor.maxLogFiles).toBe(5);
        expect(monitor.maxLogSize).toBe(5 * 1024 * 1024);
      });

      it('should create log directory if logToFile is enabled', () => {
        const monitor = new ErrorMonitor({
          logToFile: true,
          logDirectory: testLogDir
        });
        expect(existsSync(testLogDir)).toBe(true);
      });

      it('should initialize metrics', () => {
        const monitor = new ErrorMonitor();
        expect(monitor.metrics.errors).toBeInstanceOf(Map);
        expect(monitor.metrics.performance).toBeInstanceOf(Map);
        expect(monitor.metrics.startTime).toBeDefined();
        expect(monitor.metrics.totalDuration).toBe(0);
        expect(monitor.metrics.totalOperations).toBe(0);
      });
    });

    describe('logError', () => {
      it('should log error with default severity', () => {
        const monitor = new ErrorMonitor();
        const error = new Error('Test error');
        const errorId = monitor.logError(error);
        
        expect(errorId).toBeDefined();
        expect(typeof errorId).toBe('string');
      });

      it('should log error with custom severity', () => {
        const monitor = new ErrorMonitor();
        const error = new Error('Critical error');
        const errorId = monitor.logError(error, ErrorSeverity.CRITICAL);
        
        expect(errorId).toBeDefined();
        const metrics = monitor.getMetrics();
        expect(metrics.errors.critical).toBe(1);
      });

      it('should log error with context', () => {
        const monitor = new ErrorMonitor();
        const error = new Error('Test error');
        const context = { userId: '123', operation: 'test' };
        const errorId = monitor.logError(error, ErrorSeverity.HIGH, context);
        
        expect(errorId).toBeDefined();
      });

      it('should update error metrics', () => {
        const monitor = new ErrorMonitor();
        const error1 = new Error('Error 1');
        const error2 = new Error('Error 2');
        
        monitor.logError(error1, ErrorSeverity.LOW);
        monitor.logError(error2, ErrorSeverity.LOW);
        
        const metrics = monitor.getMetrics();
        expect(metrics.errors.low).toBe(2);
        expect(metrics.errors.total).toBe(2);
      });

      it('should not log when disabled', () => {
        const monitor = new ErrorMonitor({ enabled: false });
        const error = new Error('Test error');
        const errorId = monitor.logError(error);
        
        expect(errorId).toBeUndefined();
      });

      it('should handle errors without stack trace', () => {
        const monitor = new ErrorMonitor();
        const error = { message: 'Simple error' };
        const errorId = monitor.logError(error);
        
        expect(errorId).toBeDefined();
      });
    });

    describe('performance tracking', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should track operation performance', () => {
        const monitor = new ErrorMonitor({ performanceTracking: true });
        const tracker = monitor.startPerformanceTracking('test-operation');
        
        expect(tracker).toBeDefined();
        expect(tracker.id).toBeDefined();
        expect(tracker.operation).toBe('test-operation');
        expect(typeof tracker.end).toBe('function');
      });

      it('should not track when disabled', () => {
        const monitor = new ErrorMonitor({ performanceTracking: false });
        const tracker = monitor.startPerformanceTracking('test-operation');
        
        expect(tracker).toBeNull();
      });

      it('should categorize performance as fast', () => {
        const monitor = new ErrorMonitor({ performanceTracking: true });
        const duration = 50;
        const level = monitor.categorizePerformance(duration);
        
        expect(level).toBe('fast');
      });

      it('should categorize performance as normal', () => {
        const monitor = new ErrorMonitor({ performanceTracking: true });
        const duration = 300;
        const level = monitor.categorizePerformance(duration);
        
        expect(level).toBe('normal');
      });

      it('should categorize performance as slow', () => {
        const monitor = new ErrorMonitor({ performanceTracking: true });
        const duration = 800;
        const level = monitor.categorizePerformance(duration);
        
        expect(level).toBe('slow');
      });

      it('should categorize performance as critical', () => {
        const monitor = new ErrorMonitor({ performanceTracking: true });
        const duration = 5000;
        const level = monitor.categorizePerformance(duration);
        
        expect(level).toBe('critical');
      });

      it('should track complete operation lifecycle', () => {
        const monitor = new ErrorMonitor({ performanceTracking: true });
        const tracker = monitor.startPerformanceTracking('test-op');
        
        vi.advanceTimersByTime(100);
        const result = tracker.end();
        
        expect(result).toBeDefined();
        expect(result.operation).toBe('test-op');
        expect(result.duration).toBeGreaterThan(0);
      });
    });

    describe('getMetrics', () => {
      it('should return comprehensive metrics', () => {
        const monitor = new ErrorMonitor();
        const metrics = monitor.getMetrics();
        
        expect(metrics.uptime).toBeDefined();
        expect(metrics.errors).toBeDefined();
        expect(metrics.performance).toBeDefined();
        expect(metrics.health).toBeDefined();
      });

      it('should calculate uptime correctly', () => {
        const monitor = new ErrorMonitor();
        const metrics = monitor.getMetrics();
        
        expect(metrics.uptime.milliseconds).toBeGreaterThanOrEqual(0);
        expect(metrics.uptime.seconds).toBeGreaterThanOrEqual(0);
        expect(metrics.uptime.formatted).toBeDefined();
      });

      it('should track error counts by severity', () => {
        const monitor = new ErrorMonitor();
        
        monitor.logError(new Error('Low'), ErrorSeverity.LOW);
        monitor.logError(new Error('Medium'), ErrorSeverity.MEDIUM);
        monitor.logError(new Error('High'), ErrorSeverity.HIGH);
        monitor.logError(new Error('Critical'), ErrorSeverity.CRITICAL);
        
        const metrics = monitor.getMetrics();
        expect(metrics.errors.low).toBe(1);
        expect(metrics.errors.medium).toBe(1);
        expect(metrics.errors.high).toBe(1);
        expect(metrics.errors.critical).toBe(1);
        expect(metrics.errors.total).toBe(4);
      });

      it('should calculate average response time', () => {
        const monitor = new ErrorMonitor({ performanceTracking: true });
        
        const tracker1 = monitor.startPerformanceTracking('op1');
        tracker1.end();
        
        const tracker2 = monitor.startPerformanceTracking('op2');
        tracker2.end();
        
        const metrics = monitor.getMetrics();
        expect(typeof metrics.performance.averageResponseTime).toBe('number');
      });

      it('should return N/A for average when no operations tracked', () => {
        const monitor = new ErrorMonitor({ performanceTracking: true });
        const metrics = monitor.getMetrics();
        
        expect(metrics.performance.averageResponseTime).toBe('N/A - No operations tracked yet');
      });
    });

    describe('calculateHealthScore', () => {
      it('should return 100 for healthy system', () => {
        const monitor = new ErrorMonitor();
        const score = monitor.calculateHealthScore();
        
        expect(score).toBe(100);
      });

      it('should deduct points for critical errors', () => {
        const monitor = new ErrorMonitor();
        monitor.logError(new Error('Critical'), ErrorSeverity.CRITICAL);
        
        const score = monitor.calculateHealthScore();
        expect(score).toBe(80); // 100 - 20
      });

      it('should deduct points for high errors', () => {
        const monitor = new ErrorMonitor();
        monitor.logError(new Error('High'), ErrorSeverity.HIGH);
        
        const score = monitor.calculateHealthScore();
        expect(score).toBe(90); // 100 - 10
      });

      it('should deduct points for medium errors', () => {
        const monitor = new ErrorMonitor();
        monitor.logError(new Error('Medium'), ErrorSeverity.MEDIUM);
        
        const score = monitor.calculateHealthScore();
        expect(score).toBe(95); // 100 - 5
      });

      it('should deduct points for low errors', () => {
        const monitor = new ErrorMonitor();
        monitor.logError(new Error('Low'), ErrorSeverity.LOW);
        
        const score = monitor.calculateHealthScore();
        expect(score).toBe(99); // 100 - 1
      });

      it('should never go below 0', () => {
        const monitor = new ErrorMonitor();
        for (let i = 0; i < 10; i++) {
          monitor.logError(new Error('Critical'), ErrorSeverity.CRITICAL);
        }
        
        const score = monitor.calculateHealthScore();
        expect(score).toBe(0);
      });

      it('should never go above 100', () => {
        const monitor = new ErrorMonitor();
        const score = monitor.calculateHealthScore();
        
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    describe('helper methods', () => {
      it('should generate unique IDs', () => {
        const monitor = new ErrorMonitor();
        const id1 = monitor.generateId();
        const id2 = monitor.generateId();
        
        expect(id1).not.toBe(id2);
        expect(typeof id1).toBe('string');
        expect(typeof id2).toBe('string');
      });

      it('should get error count by severity', () => {
        const monitor = new ErrorMonitor();
        monitor.logError(new Error('High 1'), ErrorSeverity.HIGH);
        monitor.logError(new Error('High 2'), ErrorSeverity.HIGH);
        
        const count = monitor.getErrorCountBySeverity(ErrorSeverity.HIGH);
        expect(count).toBe(2);
      });

      it('should format uptime correctly', () => {
        const monitor = new ErrorMonitor();
        
        expect(monitor.formatUptime(30000)).toBe('30s');
        expect(monitor.formatUptime(90000)).toBe('1m 30s');
        expect(monitor.formatUptime(3600000)).toBe('1h 0m 0s');
        expect(monitor.formatUptime(86400000)).toBe('1d 0h 0m');
      });
    });
  });

  describe('trackAsyncOperation', () => {
    it('should track successful async operation', async () => {
      const asyncFn = async () => {
        return 'success';
      };
      
      const result = await trackAsyncOperation('test-op', asyncFn);
      expect(result).toBe('success');
    });

    it('should track failed async operation', async () => {
      const asyncFn = async () => {
        throw new Error('Test error');
      };
      
      await expect(trackAsyncOperation('test-op', asyncFn)).rejects.toThrow('Test error');
    });

    it('should pass context to tracker', async () => {
      const asyncFn = async () => 'success';
      const context = { userId: '123' };
      
      const result = await trackAsyncOperation('test-op', asyncFn, context);
      expect(result).toBe('success');
    });
  });

  describe('trackSyncOperation', () => {
    it('should track successful sync operation', () => {
      const syncFn = () => {
        return 'success';
      };
      
      const result = trackSyncOperation('test-op', syncFn);
      expect(result).toBe('success');
    });

    it('should track failed sync operation', () => {
      const syncFn = () => {
        throw new Error('Test error');
      };
      
      expect(() => trackSyncOperation('test-op', syncFn)).toThrow('Test error');
    });

    it('should pass context to tracker', () => {
      const syncFn = () => 'success';
      const context = { userId: '123' };
      
      const result = trackSyncOperation('test-op', syncFn, context);
      expect(result).toBe('success');
    });
  });
});
