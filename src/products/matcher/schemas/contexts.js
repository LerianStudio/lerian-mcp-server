export const contextsSchema = {
  resource: 'contexts',
  component: 'configuration',
  description: 'Matcher reconciliation contexts that scope sources, rules, and matching behavior.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/contexts',
      description: 'List reconciliation contexts with pagination and filters.',
      queryParams: {
        cursor: { type: 'string', description: 'Cursor for pagination.' },
        limit: { type: 'number', description: 'Maximum number of records.' },
        name: { type: 'string', description: 'Filter by context name.' },
        type: { type: 'string', description: 'Context type: 1:1, 1:N, N:M.' },
        status: { type: 'string', description: 'Context status: DRAFT, ACTIVE, PAUSED, ARCHIVED.' }
      },
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/contexts',
      description: 'Create a reconciliation context.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      input: {
        name: { type: 'string', required: true, description: 'Context name.' },
        interval: { type: 'string', required: true, description: 'Scheduling interval label.' },
        type: { type: 'string', required: true, description: 'Context type: 1:1, 1:N, N:M.' },
        autoMatchOnUpload: { type: 'boolean', required: false, description: 'Auto-trigger matching after upload.' },
        feeNormalization: { type: 'string', required: false, description: 'Fee normalization strategy.' },
        feeToleranceAbs: { type: 'string', required: false, description: 'Absolute fee tolerance.' },
        feeTolerancePct: { type: 'string', required: false, description: 'Percentage fee tolerance.' },
        sources: { type: 'array', required: false, description: 'Optional inline sources.' },
        rules: { type: 'array', required: false, description: 'Optional inline match rules.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/contexts/:contextId',
      description: 'Get a reconciliation context by ID.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      }
    },
    update: {
      method: 'PATCH',
      path: '/v1/contexts/:contextId',
      description: 'Update a reconciliation context by ID.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      },
      input: {
        name: { type: 'string', required: false, description: 'Updated context name.' },
        interval: { type: 'string', required: false, description: 'Updated interval.' },
        type: { type: 'string', required: false, description: 'Updated context type.' },
        autoMatchOnUpload: { type: 'boolean', required: false, description: 'Updated auto-match setting.' },
        feeNormalization: { type: 'string', required: false, description: 'Updated fee normalization strategy.' },
        feeToleranceAbs: { type: 'string', required: false, description: 'Updated absolute fee tolerance.' },
        feeTolerancePct: { type: 'string', required: false, description: 'Updated percentage fee tolerance.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/contexts/:contextId',
      description: 'Delete a reconciliation context.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      }
    },
    clone: {
      method: 'POST',
      path: '/v1/contexts/:contextId/clone',
      description: 'Clone a reconciliation context with optional sources and rules.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      },
      input: {
        name: { type: 'string', required: true, description: 'Name for the cloned context.' },
        includeRules: { type: 'boolean', required: false, description: 'Include rules in the clone.' },
        includeSources: { type: 'boolean', required: false, description: 'Include sources and field maps in the clone.' }
      }
    }
  }
};
