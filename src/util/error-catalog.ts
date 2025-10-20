/**
 * Error Catalog with User-Friendly Messages
 * Provides actionable error messages with recovery suggestions
 */

export interface ErrorDefinition {
  message: string;
  causes: string[];
  solutions: string[];
  helpUrl?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class UserFriendlyError extends Error {
  public readonly causes: string[];
  public readonly solutions: string[];
  public readonly helpUrl?: string;
  public readonly severity: string;

  constructor(definition: ErrorDefinition, context?: Record<string, any>) {
    super(definition.message);
    this.name = 'UserFriendlyError';
    this.causes = definition.causes;
    this.solutions = definition.solutions;
    this.helpUrl = definition.helpUrl;
    this.severity = definition.severity;

    if (context) {
      this.message += `\n\nContext: ${JSON.stringify(context, null, 2)}`;
    }
  }

  toString(): string {
    let output = `❌ ${this.message}\n\n`;

    if (this.causes.length > 0) {
      output += `💡 Possible causes:\n`;
      this.causes.forEach((cause, i) => {
        output += `   ${i + 1}. ${cause}\n`;
      });
      output += '\n';
    }

    if (this.solutions.length > 0) {
      output += `🔧 How to fix:\n`;
      this.solutions.forEach((solution, i) => {
        output += `   ${i + 1}. ${solution}\n`;
      });
      output += '\n';
    }

    if (this.helpUrl) {
      output += `📚 Learn more: ${this.helpUrl}\n`;
    }

    return output;
  }
}

/**
 * Error catalog with all known error types
 */
export const ErrorCatalog: Record<string, ErrorDefinition> = {
  AUTH_FAILED: {
    message: 'Authentication failed',
    causes: [
      'Invalid API key or credentials',
      'Expired authentication token',
      'Missing authentication configuration',
      'Backend service not accepting credentials'
    ],
    solutions: [
      'Check your MIDAZ_API_KEY environment variable',
      'Verify credentials haven\'t expired',
      'Run: npm run cli to configure authentication',
      'Test backend service health: curl <backend-url>/health'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/auth',
    severity: 'high'
  },

  AUTH_TOKEN_EXPIRED: {
    message: 'Authentication token has expired',
    causes: [
      'Token TTL exceeded (default: 5 minutes)',
      'Backend service invalidated the token'
    ],
    solutions: [
      'Token will be automatically refreshed on next request',
      'If issue persists, clear token cache: rm -rf ~/.midaz/cache'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/auth',
    severity: 'medium'
  },

  RESOURCE_NOT_FOUND: {
    message: 'Resource not found',
    causes: [
      'Resource ID is incorrect or doesn\'t exist',
      'Resource was deleted',
      'Wrong organization or ledger context',
      'Insufficient permissions to view resource'
    ],
    solutions: [
      'Verify the resource ID is correct (UUID format)',
      'List available resources first: use list-organizations or list-ledgers',
      'Check you\'re using the correct organization_id and ledger_id',
      'Verify your API key has access to this resource'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/resources',
    severity: 'medium'
  },

  ORGANIZATION_NOT_FOUND: {
    message: 'Organization not found',
    causes: [
      'Organization ID is incorrect',
      'Organization doesn\'t exist in the system',
      'Using wrong backend environment'
    ],
    solutions: [
      'List all organizations: use list-organizations tool',
      'Verify organization ID format (UUID v4)',
      'Check backend URL points to correct environment',
      'Create organization if needed: use create-organization tool'
    ],
    helpUrl: 'https://docs.lerian.studio/docs/organizations',
    severity: 'medium'
  },

  LEDGER_NOT_FOUND: {
    message: 'Ledger not found',
    causes: [
      'Ledger ID is incorrect',
      'Ledger doesn\'t exist in the organization',
      'Wrong organization context'
    ],
    solutions: [
      'List ledgers in organization: use list-ledgers tool',
      'Verify both organization_id and ledger_id are correct',
      'Create ledger if needed: use create-ledger tool'
    ],
    helpUrl: 'https://docs.lerian.studio/docs/ledgers',
    severity: 'medium'
  },

  VALIDATION_FAILED: {
    message: 'Input validation failed',
    causes: [
      'Required field is missing',
      'Field value doesn\'t match expected format',
      'Field value exceeds maximum length',
      'Invalid data type for field'
    ],
    solutions: [
      'Check all required fields are provided',
      'Verify UUID fields are in correct format: 12345678-1234-1234-1234-123456789012',
      'Check field length limits (e.g., name: 255 chars, description: 1000 chars)',
      'Review tool schema: use show-all-tools to see expected parameters'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/validation',
    severity: 'medium'
  },

  INVALID_UUID: {
    message: 'Invalid UUID format',
    causes: [
      'UUID is not in v4 format',
      'UUID contains invalid characters',
      'UUID is missing hyphens'
    ],
    solutions: [
      'Use UUID v4 format: 12345678-1234-1234-1234-123456789012',
      'Get valid UUIDs from list operations first',
      'Don\'t manually create UUIDs - use system-generated ones'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/validation',
    severity: 'low'
  },

  NETWORK_ERROR: {
    message: 'Network connection failed',
    causes: [
      'Backend service is down or unreachable',
      'Network connectivity issues',
      'Firewall blocking connection',
      'DNS resolution failed'
    ],
    solutions: [
      'Check backend service is running: curl <backend-url>/health',
      'Verify network connectivity: ping <backend-host>',
      'Check firewall rules allow outbound connections',
      'Try using stub mode: set MIDAZ_USE_STUBS=true'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/network',
    severity: 'high'
  },

  TIMEOUT_ERROR: {
    message: 'Request timed out',
    causes: [
      'Backend service is slow or overloaded',
      'Network latency is high',
      'Request is too complex',
      'Backend service is stuck'
    ],
    solutions: [
      'Retry the request',
      'Check backend service health and performance',
      'Simplify the request (reduce filters, limit results)',
      'Increase timeout: set MIDAZ_TIMEOUT=30000 (30 seconds)'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/performance',
    severity: 'medium'
  },

  RATE_LIMIT_EXCEEDED: {
    message: 'Rate limit exceeded',
    causes: [
      'Too many requests in short time period',
      'Default limit: 100 requests per 60 seconds',
      'Multiple concurrent operations'
    ],
    solutions: [
      'Wait 60 seconds before retrying',
      'Reduce request frequency',
      'Batch operations when possible',
      'Contact support for higher rate limits'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/rate-limits',
    severity: 'medium'
  },

  CONFIG_ERROR: {
    message: 'Configuration error',
    causes: [
      'Configuration file is malformed',
      'Required configuration is missing',
      'Configuration values are invalid',
      'Environment variables not set'
    ],
    solutions: [
      'Run configuration wizard: npm run cli',
      'Check configuration file syntax (JSON format)',
      'Set required environment variables: MIDAZ_ONBOARDING_URL, MIDAZ_API_KEY',
      'Review configuration docs: https://docs.lerian.studio/configuration'
    ],
    helpUrl: 'https://docs.lerian.studio/configuration',
    severity: 'high'
  },

  SERVICE_UNAVAILABLE: {
    message: 'Backend service unavailable',
    causes: [
      'Service is down for maintenance',
      'Service crashed or failed to start',
      'Service is overloaded',
      'Wrong service URL configured'
    ],
    solutions: [
      'Check service status page',
      'Verify service URL is correct',
      'Try again in a few minutes',
      'Use stub mode for testing: set MIDAZ_USE_STUBS=true',
      'Contact support if issue persists'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/services',
    severity: 'critical'
  },

  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error',
    causes: [
      'Backend service encountered an unexpected error',
      'Database connection failed',
      'Service bug or crash',
      'Resource exhaustion (memory, disk)'
    ],
    solutions: [
      'Retry the request',
      'Check backend service logs for details',
      'Report issue to support with request details',
      'Use stub mode as workaround: set MIDAZ_USE_STUBS=true'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/errors',
    severity: 'high'
  },

  PERMISSION_DENIED: {
    message: 'Permission denied',
    causes: [
      'API key lacks required permissions',
      'Resource belongs to different organization',
      'Operation not allowed for this user role',
      'Resource is locked or archived'
    ],
    solutions: [
      'Verify API key has correct permissions',
      'Check you\'re accessing resources in your organization',
      'Contact admin to grant required permissions',
      'Review permission model: https://docs.lerian.studio/security/permissions'
    ],
    helpUrl: 'https://docs.lerian.studio/security/permissions',
    severity: 'high'
  },

  DUPLICATE_RESOURCE: {
    message: 'Resource already exists',
    causes: [
      'Resource with same code/name already exists',
      'Unique constraint violation',
      'Attempting to recreate deleted resource'
    ],
    solutions: [
      'Use a different code or name',
      'Check existing resources: use list operations',
      'Update existing resource instead: use update operations',
      'Delete old resource first if appropriate'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/data',
    severity: 'medium'
  },

  INVALID_STATE: {
    message: 'Invalid resource state',
    causes: [
      'Resource is in wrong state for this operation',
      'Resource is locked or archived',
      'Dependent resources don\'t exist',
      'Business rule violation'
    ],
    solutions: [
      'Check resource status and state',
      'Ensure all dependencies exist (organization, ledger, etc.)',
      'Review business rules for this operation',
      'Contact support if state seems incorrect'
    ],
    helpUrl: 'https://docs.lerian.studio/troubleshooting/state',
    severity: 'medium'
  }
};

/**
 * Get error definition by code
 */
export function getErrorDefinition(code: string): ErrorDefinition | undefined {
  return ErrorCatalog[code];
}

/**
 * Create user-friendly error from code
 */
export function createUserFriendlyError(
  code: string,
  context?: Record<string, any>
): UserFriendlyError {
  const definition = getErrorDefinition(code);
  if (!definition) {
    return new UserFriendlyError({
      message: `Unknown error: ${code}`,
      causes: ['An unexpected error occurred'],
      solutions: ['Contact support with error details'],
      severity: 'high'
    }, context);
  }
  return new UserFriendlyError(definition, context);
}

/**
 * Suggest recovery actions based on error
 */
export function suggestRecovery(error: Error): string[] {
  const message = error.message.toLowerCase();
  const suggestions: string[] = [];

  if (message.includes('404') || message.includes('not found')) {
    suggestions.push('Verify the resource ID exists');
    suggestions.push('Check if you\'re using the correct organization/ledger');
    suggestions.push('List available resources first: use list-organizations');
  }

  if (message.includes('401') || message.includes('unauthorized') || message.includes('auth')) {
    suggestions.push('Check your MIDAZ_API_KEY environment variable');
    suggestions.push('Run: npm run cli to configure authentication');
    suggestions.push('Verify credentials haven\'t expired');
  }

  if (message.includes('403') || message.includes('forbidden') || message.includes('permission')) {
    suggestions.push('Verify API key has required permissions');
    suggestions.push('Check you\'re accessing resources in your organization');
    suggestions.push('Contact admin to grant required permissions');
  }

  if (message.includes('500') || message.includes('internal') || message.includes('server error')) {
    suggestions.push('Retry the request');
    suggestions.push('Check backend service health');
    suggestions.push('Use stub mode as workaround: set MIDAZ_USE_STUBS=true');
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    suggestions.push('Retry the request');
    suggestions.push('Increase timeout: set MIDAZ_TIMEOUT=30000');
    suggestions.push('Simplify the request (reduce filters, limit results)');
  }

  if (message.includes('network') || message.includes('econnrefused') || message.includes('enotfound')) {
    suggestions.push('Check backend service is running');
    suggestions.push('Verify network connectivity');
    suggestions.push('Try using stub mode: set MIDAZ_USE_STUBS=true');
  }

  if (message.includes('validation') || message.includes('invalid')) {
    suggestions.push('Check all required fields are provided');
    suggestions.push('Verify field formats (UUIDs, dates, etc.)');
    suggestions.push('Review tool schema: use show-all-tools');
  }

  if (suggestions.length === 0) {
    suggestions.push('Check error message for specific details');
    suggestions.push('Review documentation: https://docs.lerian.studio');
    suggestions.push('Contact support if issue persists');
  }

  return suggestions;
}
