export const rulesSchema = {
  resource: 'rules',
  component: 'rules',
  description: 'Tracer fraud and validation rules backed by CEL expressions and status transitions.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/rules',
      description: 'List rules with cursor-based pagination and optional scope/status filters.',
      queryParams: {
        limit: { type: 'number', description: 'Max items per page (1-100, default 10).' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        name: { type: 'string', description: 'Partial name match.' },
        status: { type: 'string', description: 'Rule status: DRAFT, ACTIVE, INACTIVE.' },
        action: { type: 'string', description: 'Decision action: ALLOW, DENY, REVIEW.' },
        accountId: { type: 'string', description: 'Scope account UUID.' },
        segmentId: { type: 'string', description: 'Scope segment UUID.' },
        portfolioId: { type: 'string', description: 'Scope portfolio UUID.' },
        merchantId: { type: 'string', description: 'Scope merchant UUID.' },
        transactionType: { type: 'string', description: 'Scope transaction type: CARD, WIRE, PIX, CRYPTO.' },
        subType: { type: 'string', description: 'Scope transaction subtype.' },
        sortBy: { type: 'string', description: 'Sort field.' },
        sortOrder: { type: 'string', description: 'Sort direction: ASC or DESC.' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/rules',
      description: 'Create a new rule in DRAFT status.',
      input: {
        name: { type: 'string', required: true, description: 'Rule name.' },
        expression: { type: 'string', required: true, description: 'CEL expression.' },
        action: { type: 'string', required: true, description: 'Decision when matched: ALLOW, DENY, REVIEW.' },
        description: { type: 'string', required: false, description: 'Optional description.' },
        scopes: { type: 'array', required: false, description: 'Optional scope array.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/rules/:id',
      description: 'Get a rule by ID.',
      pathParams: { id: { type: 'string', required: true, description: 'Rule UUID.' } }
    },
    update: {
      method: 'PATCH',
      path: '/v1/rules/:id',
      description: 'Partially update a rule.',
      pathParams: { id: { type: 'string', required: true, description: 'Rule UUID.' } },
      input: {
        name: { type: 'string', required: false, description: 'Updated rule name.' },
        expression: { type: 'string', required: false, description: 'Updated CEL expression.' },
        action: { type: 'string', required: false, description: 'Updated decision.' },
        description: { type: 'string', required: false, description: 'Updated description.' },
        scopes: { type: 'array', required: false, description: 'Updated scope array.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/rules/:id',
      description: 'Soft-delete a rule. ACTIVE rules must be deactivated first.',
      pathParams: { id: { type: 'string', required: true, description: 'Rule UUID.' } }
    },
    activate: {
      method: 'POST',
      path: '/v1/rules/:id/activate',
      description: 'Activate a rule.',
      pathParams: { id: { type: 'string', required: true, description: 'Rule UUID.' } }
    },
    deactivate: {
      method: 'POST',
      path: '/v1/rules/:id/deactivate',
      description: 'Deactivate a rule.',
      pathParams: { id: { type: 'string', required: true, description: 'Rule UUID.' } }
    },
    draft: {
      method: 'POST',
      path: '/v1/rules/:id/draft',
      description: 'Transition a rule back to draft.',
      pathParams: { id: { type: 'string', required: true, description: 'Rule UUID.' } }
    }
  }
};
