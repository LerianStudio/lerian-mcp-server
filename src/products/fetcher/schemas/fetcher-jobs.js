export const fetcherJobsSchema = {
  resource: 'fetcher-jobs',
  component: 'fetcher',
  description: 'Asynchronous data extraction jobs executed by Fetcher workers.',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/fetcher',
      description: 'Create and queue a new fetcher extraction job.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' }
      },
      input: {
        dataRequest: { type: 'object', required: true, description: 'Mapped fields and optional filters for extraction.' },
        metadata: { type: 'object', required: true, description: 'Metadata for product/source ownership and tracing. metadata.source is required.' }
      },
      example: {
        dataRequest: {
          mappedFields: {
            postgres_reporting: {
              accounts: ['id', 'email', 'created_at']
            }
          }
        },
        metadata: {
          source: 'report',
          testName: 'SingleDatasourcePostgreSQL'
        }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/fetcher/:id',
      description: 'Get one fetcher job by ID.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' }
      },
      pathParams: {
        id: { type: 'string', required: true, description: 'Fetcher job UUID.' }
      }
    }
  }
};
