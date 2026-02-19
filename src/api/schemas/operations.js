export const operationsSchema = {
  resource: 'operations',
  component: 'transaction',
  description: 'Individual debit/credit entries within a transaction affecting account balances',
  actions: {
    getByAccount: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:accountId/operations',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        accountId: { type: 'string', required: true, description: 'Account UUID' },
      },
      description: 'List operations for a specific account',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
        metadata: { type: 'object', description: 'Filter by metadata' },
      },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:accountId/operations/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        accountId: { type: 'string', required: true, description: 'Account UUID' },
        id: { type: 'string', required: true, description: 'Operation UUID' },
      },
      description: 'Get a specific operation',
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:accountId/operations/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        accountId: { type: 'string', required: true, description: 'Account UUID' },
        id: { type: 'string', required: true, description: 'Operation UUID' },
      },
      description: 'Update an operation (description and metadata only)',
      input: {
        description: { type: 'string', required: false, description: 'Updated description' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
  },
};
