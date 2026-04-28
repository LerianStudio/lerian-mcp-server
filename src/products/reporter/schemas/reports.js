export const reportsSchema = {
  resource: 'reports',
  component: 'reports',
  description: 'Reporter report creation, listing, inspection, and binary download.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/reports',
      description: 'List reports with pagination and optional filters.',
      queryParams: {
        status: { type: 'string', description: 'Report status (processing, finished, error).' },
        template_id: { type: 'string', description: 'Template UUID filter.' },
        created_at: { type: 'string', description: 'Created-at date filter (YYYY-MM-DD).' },
        limit: { type: 'number', description: 'Page size (default 10).' },
        page: { type: 'number', description: 'Page number (default 1).' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/reports',
      description: 'Create a report from an existing template.',
      requestHeaders: {
        'X-Idempotency': { required: false, description: 'Optional idempotency key for duplicate report creation.' }
      },
      input: {
        templateId: { type: 'string', required: true, description: 'Template UUID.' },
        filters: { type: 'object', required: true, description: 'Datasource/table/field filter map.' }
      },
      example: {
        templateId: '00000000-0000-0000-0000-000000000000',
        filters: {
          onboarding: {
            accounts: {
              status: {
                eq: ['active']
              }
            }
          }
        }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/reports/:id',
      description: 'Get one report by ID.',
      pathParams: {
        id: { type: 'string', required: true, description: 'Report UUID.' }
      }
    },
    download: {
      method: 'GET',
      path: '/v1/reports/:id/download',
      description: 'Download the generated report artifact.',
      responseType: 'binary',
      pathParams: {
        id: { type: 'string', required: true, description: 'Report UUID.' }
      }
    }
  }
};
