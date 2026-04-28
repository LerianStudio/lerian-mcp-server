export const connectionMigrationsSchema = {
  resource: 'connection-migrations',
  component: 'migration',
  description: 'Migration-only actions for assigning previously unowned connections to products.',
  actions: {
    listUnassigned: {
      method: 'GET',
      path: '/v1/management/connections/unassigned',
      description: 'List connections that are not yet assigned to any product.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' }
      },
      queryParams: {
        page: { type: 'number', description: 'Page number (default 1).' },
        limit: { type: 'number', description: 'Page size (default 50, max 1000).' },
        sortOrder: { type: 'string', description: 'Sort order: asc or desc.' }
      }
    },
    assign: {
      method: 'POST',
      path: '/v1/management/connections/:id/assign',
      description: 'Irreversibly assign an unassigned connection to a product.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' },
        productName: { required: true, description: 'Target product sent as X-Product-Name.' }
      },
      pathParams: {
        id: { type: 'string', required: true, description: 'Connection UUID.' }
      }
    }
  }
};
