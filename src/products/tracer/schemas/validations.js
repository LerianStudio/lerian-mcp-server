export const validationsSchema = {
  resource: 'validations',
  component: 'validations',
  description: 'Tracer transaction validation requests and validation history.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/validations',
      description: 'List validation records with pagination and filters.',
      queryParams: {
        limit: { type: 'number', description: 'Max items per page (1-1000, default 100).' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        sortBy: { type: 'string', description: 'Sort field.' },
        sortOrder: { type: 'string', description: 'Sort direction.' },
        startDate: { type: 'string', description: 'Start date RFC3339.' },
        endDate: { type: 'string', description: 'End date RFC3339.' },
        decision: { type: 'string', description: 'Decision filter: ALLOW, DENY, REVIEW.' },
        accountId: { type: 'string', description: 'Account UUID.' },
        matchedRuleId: { type: 'string', description: 'Matched rule UUID.' },
        exceededLimitId: { type: 'string', description: 'Exceeded limit UUID.' },
        segmentId: { type: 'string', description: 'Segment UUID.' },
        portfolioId: { type: 'string', description: 'Portfolio UUID.' },
        transactionType: { type: 'string', description: 'Transaction type.' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/validations',
      description: 'Validate a transaction against rules and limits.',
      input: {
        requestId: { type: 'string', required: true, description: 'Validation request UUID.' },
        amount: { type: 'string', required: true, description: 'Transaction amount as decimal string.' },
        currency: { type: 'string', required: true, description: 'Currency code.' },
        transactionTimestamp: { type: 'string', required: true, description: 'RFC3339 timestamp.' },
        transactionType: { type: 'string', required: true, description: 'Transaction type: CARD, WIRE, PIX, CRYPTO.' },
        subType: { type: 'string', required: false, description: 'Optional transaction subtype.' },
        account: { type: 'object', required: true, description: 'Account context with accountId and optional metadata.' },
        segment: { type: 'object', required: false, description: 'Optional segment context.' },
        portfolio: { type: 'object', required: false, description: 'Optional portfolio context.' },
        merchant: { type: 'object', required: false, description: 'Optional merchant context.' },
        metadata: { type: 'object', required: false, description: 'Optional validation metadata.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/validations/:id',
      description: 'Get one validation record by ID.',
      pathParams: { id: { type: 'string', required: true, description: 'Validation UUID.' } }
    }
  }
};
