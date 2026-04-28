export const sourcesSchema = {
  resource: 'sources',
  component: 'configuration',
  description: 'Matcher reconciliation sources under a context, including FETCHER and LEDGER source types.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/contexts/:contextId/sources',
      description: 'List sources for a context.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      },
      queryParams: {
        limit: { type: 'number', description: 'Maximum number of records.' },
        cursor: { type: 'string', description: 'Cursor for pagination.' },
        type: { type: 'string', description: 'Source type: LEDGER, BANK, GATEWAY, CUSTOM, FETCHER.' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/contexts/:contextId/sources',
      description: 'Create a source under a context.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      },
      input: {
        name: { type: 'string', required: true, description: 'Source name.' },
        side: { type: 'string', required: true, description: 'LEFT or RIGHT side.' },
        type: { type: 'string', required: true, description: 'Source type: LEDGER, BANK, GATEWAY, CUSTOM, FETCHER.' },
        config: { type: 'object', required: false, description: 'Source-specific configuration.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/contexts/:contextId/sources/:sourceId',
      description: 'Get a source by ID.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' },
        sourceId: { type: 'string', required: true, description: 'Source UUID.' }
      }
    },
    update: {
      method: 'PATCH',
      path: '/v1/contexts/:contextId/sources/:sourceId',
      description: 'Update a source by ID.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' },
        sourceId: { type: 'string', required: true, description: 'Source UUID.' }
      },
      input: {
        name: { type: 'string', required: false, description: 'Updated source name.' },
        side: { type: 'string', required: false, description: 'Updated side.' },
        type: { type: 'string', required: false, description: 'Updated source type.' },
        config: { type: 'object', required: false, description: 'Updated source configuration.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/contexts/:contextId/sources/:sourceId',
      description: 'Delete a source by ID.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' },
        sourceId: { type: 'string', required: true, description: 'Source UUID.' }
      }
    }
  }
};
