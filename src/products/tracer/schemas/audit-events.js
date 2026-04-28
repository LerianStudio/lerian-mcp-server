export const auditEventsSchema = {
  resource: 'audit-events',
  component: 'audit',
  description: 'Tracer audit and compliance event history.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/audit-events',
      description: 'List audit events with compliance-oriented filters and pagination.',
      queryParams: {
        startDate: { type: 'string', description: 'Start date RFC3339.' },
        endDate: { type: 'string', description: 'End date RFC3339.' },
        eventType: { type: 'string', description: 'Audit event type.' },
        action: { type: 'string', description: 'Action filter.' },
        result: { type: 'string', description: 'Result filter.' },
        resourceType: { type: 'string', description: 'Resource type filter.' },
        resourceId: { type: 'string', description: 'Resource UUID.' },
        actorType: { type: 'string', description: 'Actor type.' },
        actorId: { type: 'string', description: 'Actor identifier.' },
        accountId: { type: 'string', description: 'Account UUID.' },
        segmentId: { type: 'string', description: 'Segment UUID.' },
        portfolioId: { type: 'string', description: 'Portfolio UUID.' },
        transactionType: { type: 'string', description: 'Transaction type.' },
        matchedRuleId: { type: 'string', description: 'Matched rule UUID.' },
        limit: { type: 'number', description: 'Max items per page.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        sortBy: { type: 'string', description: 'Sort field.' },
        sortOrder: { type: 'string', description: 'Sort order.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/audit-events/:id',
      description: 'Get one audit event by ID.',
      pathParams: { id: { type: 'string', required: true, description: 'Audit event UUID.' } }
    },
    verifyHashChain: {
      method: 'GET',
      path: '/v1/audit-events/:id/verify',
      description: 'Verify the audit hash chain around a specific audit event.',
      pathParams: { id: { type: 'string', required: true, description: 'Audit event UUID.' } }
    }
  }
};
