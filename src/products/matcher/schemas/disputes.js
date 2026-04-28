export const disputesSchema = {
  resource: 'disputes',
  component: 'exceptions',
  description: 'Matcher dispute investigation and resolution workflows.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/disputes',
      description: 'List disputes with state/category/date filters.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      queryParams: {
        state: { type: 'string', description: 'Dispute state.' },
        category: { type: 'string', description: 'Dispute category.' },
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
      path: '/v1/disputes/:disputeId',
      description: 'Get a dispute by ID.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        disputeId: { type: 'string', required: true, description: 'Dispute UUID.' }
      }
    },
    close: {
      method: 'POST',
      path: '/v1/disputes/:disputeId/close',
      description: 'Close a dispute as won or lost.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' },
        'X-Idempotency-Key': { required: false, description: 'Optional idempotency key for safe retries.' }
      },
      pathParams: {
        disputeId: { type: 'string', required: true, description: 'Dispute UUID.' }
      },
      input: {
        resolution: { type: 'string', required: true, description: 'Resolution description.' },
        won: { type: 'boolean', required: false, description: 'Whether the dispute was won.' }
      }
    },
    submitEvidence: {
      method: 'POST',
      path: '/v1/disputes/:disputeId/evidence',
      description: 'Submit evidence for a dispute.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' },
        'X-Idempotency-Key': { required: false, description: 'Optional idempotency key for safe retries.' }
      },
      pathParams: {
        disputeId: { type: 'string', required: true, description: 'Dispute UUID.' }
      },
      input: {
        comment: { type: 'string', required: true, description: 'Comment describing the evidence.' },
        fileUrl: { type: 'string', required: false, description: 'Optional evidence file URL.' }
      }
    }
  }
};
