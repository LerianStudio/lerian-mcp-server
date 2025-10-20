/**
 * Core type definitions for Lerian MCP Server
 */

export interface BackendConfig {
  onboarding: ServiceConfig;
  transaction: ServiceConfig;
  timeout: number;
  retries: number;
}

export interface ServiceConfig {
  baseUrl: string;
  apiKey: string | null;
}

export interface ServerConfig {
  name: string;
  version: string;
  description: string;
}

export interface Config {
  backend: BackendConfig;
  server: ServerConfig;
  useStubs: boolean;
  logLevel: string;
  autoDetect: boolean;
  localOnly: boolean;
  docsUrl: string;
  _source?: string;
}

export interface ErrorContext {
  [key: string]: unknown;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: string;
  user?: string;
  success: boolean;
  error?: string | null;
  [key: string]: unknown;
}

export interface ValidationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface PerformanceEntry {
  id: string;
  timestamp: string;
  operation: string;
  duration: number;
  performanceLevel: 'fast' | 'normal' | 'slow' | 'critical';
  context: ErrorContext;
}

export interface ErrorEntry {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: ErrorContext;
  uptime: number;
}

export interface HealthMetrics {
  uptime: {
    milliseconds: number;
    seconds: number;
    minutes: number;
    formatted: string;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  performance: {
    total: number;
    byLevel: Record<string, number>;
    averageResponseTime: number | string;
  };
  health: number;
}

export interface DocumentResource {
  path: string;
  url: string;
  category: string;
  name: string;
  title: string;
  description?: string;
  source?: string;
}

export interface DocumentManifest {
  version: string;
  generated: string;
  source?: string;
  resources: DocumentResource[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  jitter: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
