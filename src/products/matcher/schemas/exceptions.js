export const exceptionsSchema = {
  resource: 'exceptions',
  component: 'exceptions',
  description: 'Matcher exception lifecycle, dispatch, force match, and audit history.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/exceptions',
      description: 'List exceptions with status/severity/date filters.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      queryParams: {
        status: { type: 'string', description: 'OPEN, ASSIGNED, RESOLVED.' },
        severity: { type: 'string', description: 'LOW, MEDIUM, HIGH, CRITICAL.' },
        assigned_to: { type: 'string', description: 'Assigned user.' },
        external_system: { type: 'string', description: 'External system filter.' },
        date_from: { type: 'string', description: 'Start date RFC3339.' },
        date_to: { type: 'string', description: 'End date RFC3339.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        limit: { type: 'number', description: 'Maximum number of records.' },
        sort_by: { type: 'string', description: 'Sort field.' },
        sort_order: { type: 'string', description: 'Sort order.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/exceptions/:exceptionId',
      description: 'Get one exception by ID.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        exceptionId: { type: 'string', required: true, description: 'Exception UUID.' }
      }
    },
    dispatch: {
      method: 'POST',
      path: '/v1/exceptions/:exceptionId/dispatch',
      description: 'Dispatch an exception to an external system such as JIRA or ServiceNow.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' },
        'X-Idempotency-Key': { required: false, description: 'Optional idempotency key for safe retries.' }
      },
      pathParams: {
        exceptionId: { type: 'string', required: true, description: 'Exception UUID.' }
      },
      input: {
        targetSystem: { type: 'string', required: true, description: 'Target system: JIRA, SERVICENOW, WEBHOOK, MANUAL.' },
        queue: { type: 'string', required: false, description: 'Optional queue or team assignment.' }
      }
    },
    forceMatch: {
      method: 'POST',
      path: '/v1/exceptions/:exceptionId/force-match',
      description: 'Force-match an exception with an override reason.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' },
        'X-Idempotency-Key': { required: false, description: 'Optional idempotency key for safe retries.' }
      },
      pathParams: {
        exceptionId: { type: 'string', required: true, description: 'Exception UUID.' }
      },
      input: {
        notes: { type: 'string', required: true, description: 'Notes explaining the force-match decision.' },
        overrideReason: { type: 'string', required: true, description: 'Override reason.' }
      }
    },
    adjustEntry: {
      method: 'POST',
      path: '/v1/exceptions/:exceptionId/adjust-entry',
      description: 'Resolve an exception by creating an adjustment entry.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' },
        'X-Idempotency-Key': { required: false, description: 'Optional idempotency key for safe retries.' }
      },
      pathParams: {
        exceptionId: { type: 'string', required: true, description: 'Exception UUID.' }
      },
      input: {
        amount: { type: 'number', required: true, description: 'Adjustment amount.' },
        currency: { type: 'string', required: true, description: 'Currency code.' },
        effectiveAt: { type: 'string', required: true, description: 'Effective timestamp.' },
        notes: { type: 'string', required: true, description: 'Adjustment notes.' },
        reasonCode: { type: 'string', required: true, description: 'Adjustment reason code.' }
      }
    },
    listHistory: {
      method: 'GET',
      path: '/v1/exceptions/:exceptionId/history',
      description: 'List audit history entries for an exception.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        exceptionId: { type: 'string', required: true, description: 'Exception UUID.' }
      },
      queryParams: {
        cursor: { type: 'string', description: 'Pagination cursor.' },
        limit: { type: 'number', description: 'Maximum number of history items.' }
      }
    },
    openDispute: {
      method: 'POST',
      path: '/v1/exceptions/:exceptionId/disputes',
      description: 'Open a dispute for an exception.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' },
        'X-Idempotency-Key': { required: false, description: 'Optional idempotency key for safe retries.' }
      },
      pathParams: {
        exceptionId: { type: 'string', required: true, description: 'Exception UUID.' }
      },
      input: {
        category: { type: 'string', required: true, description: 'Dispute category.' },
        description: { type: 'string', required: true, description: 'Dispute description.' }
      }
    }
  }
};
