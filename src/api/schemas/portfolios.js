export const portfoliosSchema = {
  resource: 'portfolios',
  component: 'onboarding',
  description: 'Collections of accounts grouped for organizational purposes (business units, departments, etc.)',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/portfolios',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create a new portfolio',
      input: {
        name: { type: 'string', required: true, description: 'Portfolio name (max 256 chars)' },
        entityId: { type: 'string', required: false, description: 'External entity identifier (max 256 chars)' },
        status: { type: 'object', required: false, description: 'Status object with code field' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: { name: 'Treasury Portfolio', entityId: 'EXT-001' },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/portfolios/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Portfolio UUID' },
      },
      description: 'Get portfolio by ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/portfolios',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List portfolios in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
        metadata: { type: 'object', description: 'Filter by metadata' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/portfolios/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Portfolio UUID' },
      },
      description: 'Update a portfolio',
      input: {
        name: { type: 'string', required: false, description: 'Updated name' },
        entityId: { type: 'string', required: false, description: 'Updated entity ID' },
        status: { type: 'object', required: false, description: 'Updated status' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/portfolios/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Portfolio UUID' },
      },
      description: 'Delete a portfolio',
    },
    count: {
      method: 'HEAD',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/portfolios/metrics/count',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Count portfolios in a ledger',
    },
  },
};
