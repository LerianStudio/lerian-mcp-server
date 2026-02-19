export const segmentsSchema = {
  resource: 'segments',
  component: 'onboarding',
  description: 'Logical divisions within a ledger (business areas, product lines, customer categories)',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/segments',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create a new segment',
      input: {
        name: { type: 'string', required: true, description: 'Segment name (max 256 chars)' },
        status: { type: 'object', required: false, description: 'Status object with code field' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: { name: 'Retail Banking', metadata: { region: 'LATAM' } },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/segments/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Segment UUID' },
      },
      description: 'Get segment by ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/segments',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List segments in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
        metadata: { type: 'object', description: 'Filter by metadata' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/segments/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Segment UUID' },
      },
      description: 'Update a segment',
      input: {
        name: { type: 'string', required: false, description: 'Updated name' },
        status: { type: 'object', required: false, description: 'Updated status' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/segments/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Segment UUID' },
      },
      description: 'Delete a segment',
    },
    count: {
      method: 'HEAD',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/segments/metrics/count',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Count segments in a ledger',
    },
  },
};
