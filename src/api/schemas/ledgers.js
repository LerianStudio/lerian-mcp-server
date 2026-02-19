export const ledgersSchema = {
  resource: 'ledgers',
  component: 'onboarding',
  description: 'Organizational units within an organization that group related financial accounts and assets',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers',
      pathParams: { organizationId: { type: 'string', required: true, description: 'Organization UUID' } },
      description: 'Create a new ledger',
      input: {
        name: { type: 'string', required: true, description: 'Ledger name (max 256 chars)' },
        status: { type: 'object', required: false, description: 'Status object with code field' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: { name: 'Treasury Operations', metadata: { department: 'Finance' } },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        id: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Get ledger by ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers',
      pathParams: { organizationId: { type: 'string', required: true, description: 'Organization UUID' } },
      description: 'List ledgers in an organization',
      queryParams: {
        limit: { type: 'number', description: 'Items per page (1-100)' },
        page: { type: 'number', description: 'Page number' },
        metadata: { type: 'object', description: 'Filter by metadata' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        id: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Update a ledger',
      input: {
        name: { type: 'string', required: false, description: 'Updated name' },
        status: { type: 'object', required: false, description: 'Updated status' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        id: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Delete a ledger',
    },
    count: {
      method: 'HEAD',
      path: '/v1/organizations/:organizationId/ledgers/metrics/count',
      pathParams: { organizationId: { type: 'string', required: true, description: 'Organization UUID' } },
      description: 'Count ledgers in an organization',
    },
  },
};
