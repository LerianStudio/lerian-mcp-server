export const fieldMapsSchema = {
  resource: 'field-maps',
  component: 'configuration',
  description: 'Matcher field map configuration for normalizing source data into reconciliation fields.',
  actions: {
    getBySource: {
      method: 'GET',
      path: '/v1/contexts/:contextId/sources/:sourceId/field-maps',
      description: 'Get the field map configured for a source.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' },
        sourceId: { type: 'string', required: true, description: 'Source UUID.' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/contexts/:contextId/sources/:sourceId/field-maps',
      description: 'Create a field map for a source.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' },
        sourceId: { type: 'string', required: true, description: 'Source UUID.' }
      },
      input: {
        mapping: { type: 'object', required: true, description: 'Field mapping object.' }
      }
    },
    update: {
      method: 'PATCH',
      path: '/v1/field-maps/:fieldMapId',
      description: 'Update a field map by its fieldMapId.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        fieldMapId: { type: 'string', required: true, description: 'Field map UUID.' }
      },
      input: {
        mapping: { type: 'object', required: true, description: 'Updated field mapping object.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/field-maps/:fieldMapId',
      description: 'Delete a field map by its fieldMapId.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        fieldMapId: { type: 'string', required: true, description: 'Field map UUID.' }
      }
    }
  }
};
