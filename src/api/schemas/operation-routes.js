export const operationRoutesSchema = {
  resource: 'operation-routes',
  component: 'transaction',
  description: 'Rule-based routing for operations with account selection rules (alias or account_type matching)',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/operation-routes',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create an operation route with account selection rules',
      input: {
        title: { type: 'string', required: true, description: 'Route title (max 256 chars)' },
        operationType: { type: 'string', required: true, description: 'Operation type: "source" or "destination"' },
        code: { type: 'string', required: false, description: 'Route code (max 100 chars)' },
        description: { type: 'string', required: false, description: 'Route description (max 500 chars)' },
        account: {
          type: 'object', required: false, description: 'Account selection rule',
          properties: {
            ruleType: { type: 'string', description: '"alias" (match by alias) or "account_type" (match by type)' },
            validIf: { type: 'any', description: 'For alias: string pattern. For account_type: array of type key values' },
          },
        },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: {
        title: 'Source from checking accounts',
        operationType: 'source',
        code: 'SRC_CHECKING',
        account: { ruleType: 'account_type', validIf: ['checking', 'savings'] },
      },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/operation-routes/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Operation Route UUID' },
      },
      description: 'Get operation route by ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/operation-routes',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List operation routes in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/operation-routes/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Operation Route UUID' },
      },
      description: 'Update an operation route',
      input: {
        title: { type: 'string', required: false, description: 'Updated title' },
        description: { type: 'string', required: false, description: 'Updated description' },
        account: { type: 'object', required: false, description: 'Updated account rule' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/operation-routes/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Operation Route UUID' },
      },
      description: 'Delete an operation route',
    },
  },
};
