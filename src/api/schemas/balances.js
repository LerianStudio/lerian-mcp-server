export const balancesSchema = {
  resource: 'balances',
  component: 'transaction',
  description: 'Account balances tracking available/onHold amounts per asset with multi-key support',
  actions: {
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:accountId/balances/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        accountId: { type: 'string', required: true, description: 'Account UUID' },
        id: { type: 'string', required: true, description: 'Balance UUID' },
      },
      description: 'Get balance by ID',
    },
    getByAccount: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:accountId/balances',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        accountId: { type: 'string', required: true, description: 'Account UUID' },
      },
      description: 'List balances for a specific account',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
      },
    },
    getByAlias: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/balances/aliases/:alias',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        alias: { type: 'string', required: true, description: 'Account alias (e.g. @treasury)' },
      },
      description: 'Get balances by account alias',
    },
    getByExternalId: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/balances/external/:externalId',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        externalId: { type: 'string', required: true, description: 'External system identifier' },
      },
      description: 'Get balances by external ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/balances',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List all balances in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
      },
    },
    createAdditional: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:accountId/balances',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        accountId: { type: 'string', required: true, description: 'Account UUID' },
      },
      description: 'Create an additional balance with a custom key (e.g. asset-freeze)',
      input: {
        key: { type: 'string', required: true, description: 'Unique balance key (max 100, no whitespace, e.g. "asset-freeze")' },
        allowSending: { type: 'boolean', required: false, description: 'Allow sending from this balance' },
        allowReceiving: { type: 'boolean', required: false, description: 'Allow receiving to this balance' },
      },
      example: { key: 'asset-freeze', allowSending: false, allowReceiving: true },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:accountId/balances/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        accountId: { type: 'string', required: true, description: 'Account UUID' },
        id: { type: 'string', required: true, description: 'Balance UUID' },
      },
      description: 'Update balance permissions',
      input: {
        allowSending: { type: 'boolean', required: false, description: 'Allow sending from this balance' },
        allowReceiving: { type: 'boolean', required: false, description: 'Allow receiving to this balance' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/accounts/:accountId/balances/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        accountId: { type: 'string', required: true, description: 'Account UUID' },
        id: { type: 'string', required: true, description: 'Balance UUID' },
      },
      description: 'Delete a balance',
    },
  },
};
