export const dataSourcesSchema = {
  resource: 'data-sources',
  component: 'data-sources',
  description: 'Reporter datasource discovery and schema inspection surface.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/data-sources',
      description: 'List all connected data sources with their table metadata.'
    },
    get: {
      method: 'GET',
      path: '/v1/data-sources/:dataSourceId',
      description: 'Get one data source definition by ID.',
      pathParams: {
        dataSourceId: { type: 'string', required: true, description: 'Datasource ID.' }
      }
    }
  }
};
