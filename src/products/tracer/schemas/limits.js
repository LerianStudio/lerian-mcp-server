export const limitsSchema = {
  resource: 'limits',
  component: 'limits',
  description: 'Tracer spending limits and usage tracking.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/limits',
      description: 'List limits with cursor-based pagination and optional filters.',
      queryParams: {
        limit: { type: 'number', description: 'Max items per page (1-100, default 10).' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        name: { type: 'string', description: 'Partial name match.' },
        status: { type: 'string', description: 'Limit status: DRAFT, ACTIVE, INACTIVE.' },
        limitType: { type: 'string', description: 'Limit type: DAILY, MONTHLY, PER_TRANSACTION.' },
        accountId: { type: 'string', description: 'Scope account UUID.' },
        segmentId: { type: 'string', description: 'Scope segment UUID.' },
        portfolioId: { type: 'string', description: 'Scope portfolio UUID.' },
        merchantId: { type: 'string', description: 'Scope merchant UUID.' },
        transactionType: { type: 'string', description: 'Scope transaction type.' },
        subType: { type: 'string', description: 'Scope transaction subtype.' },
        sortBy: { type: 'string', description: 'Sort field.' },
        sortOrder: { type: 'string', description: 'Sort direction.' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/limits',
      description: 'Create a new spending limit in DRAFT status.',
      input: {
        name: { type: 'string', required: true, description: 'Limit name.' },
        limitType: { type: 'string', required: true, description: 'Limit type: DAILY, MONTHLY, PER_TRANSACTION.' },
        currency: { type: 'string', required: true, description: '3-letter currency code.' },
        maxAmount: { type: 'string', required: true, description: 'Max amount as decimal string.' },
        scopes: { type: 'array', required: true, description: 'One or more scopes.' },
        description: { type: 'string', required: false, description: 'Optional description.' },
        activeTimeStart: { type: 'string', required: false, description: 'Optional daily start time.' },
        activeTimeEnd: { type: 'string', required: false, description: 'Optional daily end time.' },
        customStartDate: { type: 'string', required: false, description: 'Optional custom period start.' },
        customEndDate: { type: 'string', required: false, description: 'Optional custom period end.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/limits/:id',
      description: 'Get a limit by ID.',
      pathParams: { id: { type: 'string', required: true, description: 'Limit UUID.' } }
    },
    update: {
      method: 'PATCH',
      path: '/v1/limits/:id',
      description: 'Partially update a limit.',
      pathParams: { id: { type: 'string', required: true, description: 'Limit UUID.' } },
      input: {
        name: { type: 'string', required: false, description: 'Updated limit name.' },
        maxAmount: { type: 'string', required: false, description: 'Updated max amount.' },
        description: { type: 'string', required: false, description: 'Updated description.' },
        scopes: { type: 'array', required: false, description: 'Updated scopes.' },
        activeTimeStart: { type: 'string', required: false, description: 'Updated daily start time.' },
        activeTimeEnd: { type: 'string', required: false, description: 'Updated daily end time.' },
        customStartDate: { type: 'string', required: false, description: 'Updated custom start.' },
        customEndDate: { type: 'string', required: false, description: 'Updated custom end.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/limits/:id',
      description: 'Soft-delete a limit. ACTIVE limits must be deactivated first.',
      pathParams: { id: { type: 'string', required: true, description: 'Limit UUID.' } }
    },
    activate: {
      method: 'POST',
      path: '/v1/limits/:id/activate',
      description: 'Activate a limit.',
      pathParams: { id: { type: 'string', required: true, description: 'Limit UUID.' } }
    },
    deactivate: {
      method: 'POST',
      path: '/v1/limits/:id/deactivate',
      description: 'Deactivate a limit.',
      pathParams: { id: { type: 'string', required: true, description: 'Limit UUID.' } }
    },
    draft: {
      method: 'POST',
      path: '/v1/limits/:id/draft',
      description: 'Transition a limit back to draft.',
      pathParams: { id: { type: 'string', required: true, description: 'Limit UUID.' } }
    },
    getUsage: {
      method: 'GET',
      path: '/v1/limits/:id/usage',
      description: 'Get usage snapshot for a limit.',
      pathParams: { id: { type: 'string', required: true, description: 'Limit UUID.' } }
    }
  }
};
