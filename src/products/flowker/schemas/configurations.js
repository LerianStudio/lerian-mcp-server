import { flowkerAuthHeaders } from './shared.js';

export const executorConfigurationsSchema = {
  resource: 'executor-configurations',
  component: 'executor-configuration',
  description: 'Persisted executor configuration objects that define outbound execution endpoints and auth.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/executors',
      description: 'List executor configurations with status filters and cursor pagination.',
      requestHeaders: flowkerAuthHeaders,
      queryParams: {
        status: { type: 'string', description: 'Filter by status: unconfigured, configured, tested, active, disabled.' },
        limit: { type: 'number', description: 'Page size between 1 and 100. Default 10.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        sortBy: { type: 'string', description: 'Sort field: createdAt, updatedAt, or name. Default createdAt.' },
        sortOrder: { type: 'string', description: 'Sort order: ASC or DESC. Default DESC.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/executors/:id',
      description: 'Get one executor configuration by ID.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Executor configuration UUID.' }
      }
    },
    update: {
      method: 'PATCH',
      path: '/v1/executors/:id',
      description: 'Update an executor configuration, including base URL, auth, endpoints, and metadata.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Executor configuration UUID.' }
      },
      input: {
        name: { type: 'string', required: true, description: 'Executor configuration name.' },
        description: { type: 'string', required: false, description: 'Optional executor description.' },
        baseUrl: { type: 'string', required: true, description: 'Base URL for the executor target system.' },
        authentication: { type: 'object', required: true, description: 'Authentication object with type and optional config.' },
        endpoints: { type: 'array', required: true, description: 'Executor endpoints. Each item includes name, method, path, and optional timeout.' },
        metadata: { type: 'object', required: false, description: 'Optional arbitrary metadata.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/executors/:id',
      description: 'Delete an executor configuration when it is in a deletable status.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Executor configuration UUID.' }
      }
    }
  }
};

export const providerConfigurationsSchema = {
  resource: 'provider-configurations',
  component: 'provider-configuration',
  description: 'Provider configuration lifecycle, connectivity testing, and enable/disable transitions.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/provider-configurations',
      description: 'List provider configurations with status/provider filters and cursor pagination.',
      requestHeaders: flowkerAuthHeaders,
      queryParams: {
        status: { type: 'string', description: 'Filter by status: active or disabled.' },
        providerId: { type: 'string', description: 'Filter by provider catalog ID.' },
        limit: { type: 'number', description: 'Page size between 1 and 100. Default 10.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        sortBy: { type: 'string', description: 'Sort field: createdAt, updatedAt, or name. Default createdAt.' },
        sortOrder: { type: 'string', description: 'Sort order: ASC or DESC. Default DESC.' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/provider-configurations',
      description: 'Create a new provider configuration validated against the provider JSON Schema.',
      requestHeaders: flowkerAuthHeaders,
      input: {
        providerId: { type: 'string', required: true, description: 'Catalog provider ID.' },
        name: { type: 'string', required: true, description: 'Provider configuration name.' },
        description: { type: 'string', required: false, description: 'Optional provider configuration description.' },
        config: { type: 'object', required: true, description: 'Provider-specific configuration payload.' },
        metadata: { type: 'object', required: false, description: 'Optional arbitrary metadata.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/provider-configurations/:id',
      description: 'Get one provider configuration by ID.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Provider configuration UUID.' }
      }
    },
    update: {
      method: 'PATCH',
      path: '/v1/provider-configurations/:id',
      description: 'Update a provider configuration and revalidate it if config changes.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Provider configuration UUID.' }
      },
      input: {
        name: { type: 'string', required: false, description: 'Updated provider configuration name.' },
        description: { type: 'string', required: false, description: 'Updated description.' },
        config: { type: 'object', required: false, description: 'Updated provider-specific configuration payload.' },
        metadata: { type: 'object', required: false, description: 'Updated metadata.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/provider-configurations/:id',
      description: 'Delete a provider configuration.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Provider configuration UUID.' }
      }
    },
    enable: {
      method: 'POST',
      path: '/v1/provider-configurations/:id/enable',
      description: 'Transition a provider configuration to active status.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Provider configuration UUID.' }
      }
    },
    disable: {
      method: 'POST',
      path: '/v1/provider-configurations/:id/disable',
      description: 'Transition a provider configuration to disabled status.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Provider configuration UUID.' }
      }
    },
    test: {
      method: 'POST',
      path: '/v1/provider-configurations/:id/test',
      description: 'Test provider connectivity, authentication, and end-to-end communication.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Provider configuration UUID.' }
      }
    }
  }
};
