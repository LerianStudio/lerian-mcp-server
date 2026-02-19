export const organizationsSchema = {
  resource: 'organizations',
  component: 'onboarding',
  description: 'Top-level entities representing companies or business units in Midaz',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations',
      description: 'Create a new organization',
      input: {
        legalName: { type: 'string', required: true, description: 'Official legal name (max 256 chars)' },
        legalDocument: { type: 'string', required: true, description: 'Tax ID or registration number (max 256 chars)' },
        parentOrganizationId: { type: 'string', required: false, description: 'UUID of parent organization' },
        doingBusinessAs: { type: 'string', required: false, description: 'Trading/brand name (max 256 chars)' },
        address: {
          type: 'object', required: false, description: 'Physical address',
          properties: {
            line1: { type: 'string', description: 'Street address' },
            line2: { type: 'string', description: 'Suite/apartment' },
            zipCode: { type: 'string', description: 'Postal code' },
            city: { type: 'string', description: 'City' },
            state: { type: 'string', description: 'State/province' },
            country: { type: 'string', description: 'ISO 3166-1 alpha-2 country code (2 chars)' },
          },
        },
        status: { type: 'object', required: false, description: 'Status object with code field (e.g. {code: "ACTIVE"})' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: {
        legalName: 'Acme Corp',
        legalDocument: '12345678000195',
        doingBusinessAs: 'Acme',
        address: { line1: '123 Main St', city: 'New York', state: 'NY', country: 'US', zipCode: '10001' },
        metadata: { industry: 'fintech' },
      },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:id',
      pathParams: { id: { type: 'string', required: true, description: 'Organization UUID' } },
      description: 'Get organization by ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations',
      description: 'List all organizations',
      queryParams: {
        limit: { type: 'number', description: 'Items per page (1-100, default 10)' },
        page: { type: 'number', description: 'Page number (default 1)' },
        metadata: { type: 'object', description: 'Filter by metadata key-value pairs' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:id',
      pathParams: { id: { type: 'string', required: true, description: 'Organization UUID' } },
      description: 'Update an organization (partial update)',
      input: {
        legalName: { type: 'string', required: false, description: 'Updated legal name' },
        parentOrganizationId: { type: 'string', required: false, description: 'Updated parent org UUID' },
        doingBusinessAs: { type: 'string', required: false, description: 'Updated trading name' },
        address: { type: 'object', required: false, description: 'Updated address' },
        status: { type: 'object', required: false, description: 'Updated status' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:id',
      pathParams: { id: { type: 'string', required: true, description: 'Organization UUID' } },
      description: 'Delete an organization',
    },
    count: {
      method: 'HEAD',
      path: '/v1/organizations/metrics/count',
      description: 'Count organizations (returns count in Midaz-Total-Count header)',
    },
  },
};
