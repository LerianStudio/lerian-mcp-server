export const transactionRoutesSchema = {
  resource: 'transaction-routes',
  component: 'transaction',
  description: 'Composite routing that combines multiple operation routes for transaction processing',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transaction-routes',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create a transaction route from existing operation routes',
      input: {
        title: { type: 'string', required: true, description: 'Route title (max 256 chars)' },
        operationRoutes: { type: 'array', required: true, description: 'Array of Operation Route UUIDs to combine' },
        description: { type: 'string', required: false, description: 'Route description (max 500 chars)' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: {
        title: 'Checking-to-Savings Transfer',
        operationRoutes: ['<source-op-route-uuid>', '<dest-op-route-uuid>'],
        description: 'Route for internal transfers between checking and savings accounts',
      },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transaction-routes/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Transaction Route UUID' },
      },
      description: 'Get transaction route by ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transaction-routes',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List transaction routes in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transaction-routes/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Transaction Route UUID' },
      },
      description: 'Update a transaction route',
      input: {
        title: { type: 'string', required: false, description: 'Updated title' },
        description: { type: 'string', required: false, description: 'Updated description' },
        operationRoutes: { type: 'array', required: false, description: 'Updated operation route UUIDs' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transaction-routes/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Transaction Route UUID' },
      },
      description: 'Delete a transaction route',
    },
  },
};
