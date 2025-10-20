/**
 * Shared validation utilities and common schemas
 * Reduces code duplication across tools
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid().describe('UUID in v4 format (e.g., 12345678-1234-1234-1234-123456789012)'),
  
  organizationId: z.string().uuid().describe('Organization ID in UUID v4 format (REQUIRED). Parent container for all resources. Format: \'12345678-1234-1234-1234-123456789012\'. Get from list-organizations first.'),
  
  ledgerId: z.string().uuid().describe('Ledger ID in UUID v4 format (REQUIRED). Container for accounts and transactions. Format: \'12345678-1234-1234-1234-123456789012\'. Get from list-ledgers first.'),
  
  accountId: z.string().uuid().describe('Account ID in UUID v4 format. Format: \'12345678-1234-1234-1234-123456789012\'.'),
  
  transactionId: z.string().uuid().describe('Transaction ID in UUID v4 format. Format: \'12345678-1234-1234-1234-123456789012\'.'),
  
  pagination: z.object({
    limit: z.number().min(1).max(100).default(10).describe('Number of items to return (1-100, default: 10)'),
    cursor: z.string().optional().describe('Pagination cursor from previous response')
  }).optional(),
  
  metadata: z.record(z.string(), z.any()).optional().describe('Custom metadata as key-value pairs'),
  
  name: z.string().min(1).max(255).describe('Name (1-255 characters)'),
  
  description: z.string().max(1000).optional().describe('Description (max 1000 characters)'),
  
  code: z.string().min(1).max(100).describe('Unique code identifier (1-100 characters)'),
  
  status: z.enum(['active', 'inactive', 'pending', 'completed', 'failed']).optional(),
  
  dateRange: z.object({
    startDate: z.string().datetime().optional().describe('Start date in ISO 8601 format'),
    endDate: z.string().datetime().optional().describe('End date in ISO 8601 format')
  }).optional(),
  
  amount: z.number().describe('Amount (numeric value)'),
  
  assetCode: z.string().min(1).max(10).describe('Asset code (e.g., USD, EUR, BTC)'),
  
  mode: z.enum(['test', 'execute']).default('test').describe('Execution mode: test (dry-run validation) or execute (real API call)')
};

/**
 * Create a list operation schema
 */
export function createListSchema(_resourceName: string) {
  return z.object({
    organization_id: commonSchemas.organizationId,
    ledger_id: commonSchemas.ledgerId.optional(),
    limit: z.number().min(1).max(100).default(10).optional(),
    cursor: z.string().optional(),
    filters: z.record(z.string(), z.any()).optional().describe('Optional filters as key-value pairs')
  });
}

/**
 * Create a get operation schema
 */
export function createGetSchema(resourceName: string) {
  return z.object({
    organization_id: commonSchemas.organizationId,
    ledger_id: commonSchemas.ledgerId.optional(),
    id: commonSchemas.uuid.describe(`${resourceName} ID`)
  });
}

/**
 * Create a create operation schema
 */
export function createCreateSchema(resourceName: string, additionalFields: z.ZodRawShape) {
  return z.object({
    organization_id: commonSchemas.organizationId,
    ledger_id: commonSchemas.ledgerId.optional(),
    ...additionalFields
  });
}

/**
 * Create an update operation schema
 */
export function createUpdateSchema(resourceName: string, additionalFields: z.ZodRawShape) {
  return z.object({
    organization_id: commonSchemas.organizationId,
    ledger_id: commonSchemas.ledgerId.optional(),
    id: commonSchemas.uuid.describe(`${resourceName} ID to update`),
    ...additionalFields
  });
}

/**
 * Create a delete operation schema
 */
export function createDeleteSchema(resourceName: string) {
  return z.object({
    organization_id: commonSchemas.organizationId,
    ledger_id: commonSchemas.ledgerId.optional(),
    id: commonSchemas.uuid.describe(`${resourceName} ID to delete`)
  });
}

/**
 * Validate UUID format
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential XSS characters
}

/**
 * Validate and sanitize metadata
 */
export function validateMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    const sanitizedKey = sanitizeString(key, 100);
    
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value, 1000);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    } else if (value === null) {
      sanitized[sanitizedKey] = null;
    }
  }
  
  return sanitized;
}
