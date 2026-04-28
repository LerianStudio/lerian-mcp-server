export const connectionsSchema = {
  resource: 'connections',
  component: 'management',
  description: 'Datasource connections used by Lerian products for schema inspection and data extraction.',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/management/connections',
      description: 'Create a new datasource connection for an organization and product.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' },
        productName: { required: true, description: 'Owning product name sent as X-Product-Name.' }
      },
      input: {
        configName: { type: 'string', required: true, description: 'Unique connection name.' },
        type: { type: 'string', required: true, description: 'Database type (POSTGRESQL, MYSQL, MONGODB, SQL_SERVER, ORACLE).' },
        host: { type: 'string', required: true, description: 'Database host.' },
        port: { type: 'number', required: true, description: 'Database port.' },
        databaseName: { type: 'string', required: true, description: 'Database name.' },
        userName: { type: 'string', required: true, description: 'Database user name.' },
        password: { type: 'string', required: true, description: 'Database password.' },
        metadata: { type: 'object', required: false, description: 'Optional driver-specific metadata.' },
        ssl: { type: 'object', required: false, description: 'Optional SSL/TLS settings.' }
      },
      example: {
        configName: 'postgres_reporting',
        type: 'POSTGRESQL',
        host: 'host.docker.internal',
        port: 5432,
        databaseName: 'postgres',
        userName: 'postgres',
        password: 'postgres'
      }
    },
    list: {
      method: 'GET',
      path: '/v1/management/connections',
      description: 'List datasource connections with pagination and optional product/type filters.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' },
        productName: { required: false, description: 'Optional product filter sent as X-Product-Name.' }
      },
      queryParams: {
        page: { type: 'number', description: 'Page number (default 1).' },
        limit: { type: 'number', description: 'Page size (default 50, max 1000).' },
        sortOrder: { type: 'string', description: 'Sort order: asc or desc.' },
        type: { type: 'string', description: 'Filter by datasource type.' },
        host: { type: 'string', description: 'Filter by host.' },
        databaseName: { type: 'string', description: 'Filter by database name.' },
        startDate: { type: 'string', description: 'Filter by start date.' },
        endDate: { type: 'string', description: 'Filter by end date.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/management/connections/:id',
      description: 'Get one connection by ID.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' }
      },
      pathParams: {
        id: { type: 'string', required: true, description: 'Connection UUID.' }
      }
    },
    update: {
      method: 'PATCH',
      path: '/v1/management/connections/:id',
      description: 'Update connection fields partially.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' }
      },
      pathParams: {
        id: { type: 'string', required: true, description: 'Connection UUID.' }
      },
      input: {
        configName: { type: 'string', required: false, description: 'Updated connection name.' },
        host: { type: 'string', required: false, description: 'Updated host.' },
        port: { type: 'number', required: false, description: 'Updated port.' },
        databaseName: { type: 'string', required: false, description: 'Updated database name.' },
        userName: { type: 'string', required: false, description: 'Updated user name.' },
        password: { type: 'string', required: false, description: 'Updated password.' },
        metadata: { type: 'object', required: false, description: 'Updated metadata.' },
        ssl: { type: 'object', required: false, description: 'Updated SSL/TLS settings.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/management/connections/:id',
      description: 'Delete a connection when no active jobs are using it.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' }
      },
      pathParams: {
        id: { type: 'string', required: true, description: 'Connection UUID.' }
      }
    },
    test: {
      method: 'POST',
      path: '/v1/management/connections/:id/test',
      description: 'Test a configured connection.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' }
      },
      pathParams: {
        id: { type: 'string', required: true, description: 'Connection UUID.' }
      }
    },
    getSchema: {
      method: 'GET',
      path: '/v1/management/connections/:id/schema',
      description: 'Inspect the tables and fields exposed by a connection.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' }
      },
      pathParams: {
        id: { type: 'string', required: true, description: 'Connection UUID.' }
      }
    },
    validateSchema: {
      method: 'POST',
      path: '/v1/management/connections/validate-schema',
      description: 'Validate mapped fields against configured datasource schemas.',
      context: {
        organizationId: { required: true, description: 'Organization UUID sent as X-Organization-Id.' }
      },
      input: {
        mappedFields: { type: 'object', required: true, description: 'Datasource-to-table-to-field mapping to validate.' }
      },
      example: {
        mappedFields: {
          postgres_reporting: {
            accounts: ['id', 'email', 'created_at']
          }
        }
      }
    }
  }
};
