export const accountsSchema = {
  resource: 'accounts',
  component: 'onboarding',
  description: 'Financial accounts within a ledger for tracking balances and transactions',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create a new account',
      input: {
        assetCode: { type: 'string', required: true, description: 'Asset code for balances (e.g. USD)' },
        type: { type: 'string', required: true, description: 'Account type (e.g. deposit, savings). Cannot be "external"' },
        name: { type: 'string', required: false, description: 'Account name (max 256 chars)' },
        alias: { type: 'string', required: false, description: 'Unique alias (e.g. @treasury_checking, max 100 chars)' },
        parentAccountId: { type: 'string', required: false, description: 'Parent account UUID for sub-accounts' },
        entityId: { type: 'string', required: false, description: 'External system identifier (max 256 chars)' },
        portfolioId: { type: 'string', required: false, description: 'Portfolio UUID to assign' },
        segmentId: { type: 'string', required: false, description: 'Segment UUID to assign' },
        blocked: { type: 'boolean', required: false, description: 'Whether account starts blocked (default false)' },
        status: { type: 'object', required: false, description: 'Status object with code field' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: {
        name: 'Corporate Checking',
        assetCode: 'USD',
        type: 'deposit',
        alias: '@corp_checking',
        metadata: { department: 'Treasury' },
      },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Account UUID' },
      },
      description: 'Get account by ID',
    },
    getByAlias: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/aliases/:alias',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        alias: { type: 'string', required: true, description: 'Account alias (e.g. @treasury_checking)' },
      },
      description: 'Get account by alias',
    },
    getByExternalId: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/external/:externalId',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        externalId: { type: 'string', required: true, description: 'External system identifier' },
      },
      description: 'Get account by external ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List accounts in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
        metadata: { type: 'object', description: 'Filter by metadata' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Account UUID' },
      },
      description: 'Update an account',
      input: {
        name: { type: 'string', required: false, description: 'Updated name' },
        segmentId: { type: 'string', required: false, description: 'Updated segment UUID' },
        portfolioId: { type: 'string', required: false, description: 'Updated portfolio UUID' },
        entityId: { type: 'string', required: false, description: 'Updated external ID' },
        blocked: { type: 'boolean', required: false, description: 'Block/unblock account' },
        status: { type: 'object', required: false, description: 'Updated status' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Account UUID' },
      },
      description: 'Delete an account',
    },
    count: {
      method: 'HEAD',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/metrics/count',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Count accounts in a ledger',
    },
  },
};
