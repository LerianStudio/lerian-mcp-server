export const assetsSchema = {
  resource: 'assets',
  component: 'onboarding',
  description: 'Financial instruments within a ledger (currencies, crypto, commodities, etc.)',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/assets',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create a new asset',
      input: {
        name: { type: 'string', required: true, description: 'Asset name (max 256 chars)' },
        type: { type: 'string', required: true, description: 'Asset type (e.g. currency, cryptocurrency, commodity)' },
        code: { type: 'string', required: true, description: 'Unique asset code/symbol (max 100 chars, e.g. USD, BTC)' },
        status: { type: 'object', required: false, description: 'Status object with code field' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: { name: 'US Dollar', type: 'currency', code: 'USD', metadata: { symbol: '$' } },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/assets/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Asset UUID' },
      },
      description: 'Get asset by ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/assets',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List assets in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
        metadata: { type: 'object', description: 'Filter by metadata' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/assets/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Asset UUID' },
      },
      description: 'Update an asset',
      input: {
        name: { type: 'string', required: false, description: 'Updated name' },
        status: { type: 'object', required: false, description: 'Updated status' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/assets/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Asset UUID' },
      },
      description: 'Delete an asset',
    },
    count: {
      method: 'HEAD',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/assets/metrics/count',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Count assets in a ledger',
    },
  },
};
