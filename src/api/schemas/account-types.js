export const accountTypesSchema = {
  resource: 'account-types',
  component: 'onboarding',
  description: 'Custom account type taxonomies with name, description, and unique key value',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/account-types',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create a new account type',
      input: {
        name: { type: 'string', required: true, description: 'Account type name (max 100 chars)' },
        keyValue: { type: 'string', required: true, description: 'Unique key identifier (max 50 chars, e.g. current_assets)' },
        description: { type: 'string', required: false, description: 'Detailed description (max 500 chars)' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: { name: 'Current Assets', keyValue: 'current_assets', description: 'Assets expected to be converted to cash within one year' },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/account-types/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Account Type UUID' },
      },
      description: 'Get account type by ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/account-types',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List account types in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/account-types/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Account Type UUID' },
      },
      description: 'Update an account type',
      input: {
        name: { type: 'string', required: false, description: 'Updated name' },
        description: { type: 'string', required: false, description: 'Updated description' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/account-types/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Account Type UUID' },
      },
      description: 'Delete an account type',
    },
  },
};
