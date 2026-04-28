import { flowkerAuthHeaders } from './shared.js';

export const catalogExecutorsSchema = {
  resource: 'catalog-executors',
  component: 'catalog',
  description: 'Built-in executor definitions and JSON Schema validation contracts from the Flowker catalog.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/catalog/executors',
      description: 'List all built-in executors registered in the Flowker catalog.',
      requestHeaders: flowkerAuthHeaders
    },
    get: {
      method: 'GET',
      path: '/v1/catalog/executors/:id',
      description: 'Get executor metadata and its configuration JSON Schema.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Catalog executor ID.' }
      }
    },
    validateConfig: {
      method: 'POST',
      path: '/v1/catalog/executors/:id/validate',
      description: 'Validate an executor configuration object against the executor catalog schema.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Catalog executor ID.' }
      },
      input: {
        config: { type: 'object', required: true, description: 'Executor configuration object to validate.' }
      }
    }
  }
};

export const catalogProvidersSchema = {
  resource: 'catalog-providers',
  component: 'catalog',
  description: 'Provider catalog used to create and validate provider configurations.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/catalog/providers',
      description: 'List all providers registered in the static Flowker catalog.',
      requestHeaders: flowkerAuthHeaders
    },
    get: {
      method: 'GET',
      path: '/v1/catalog/providers/:id',
      description: 'Get provider metadata and its configuration schema.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Catalog provider ID.' }
      }
    },
    listExecutors: {
      method: 'GET',
      path: '/v1/catalog/providers/:id/executors',
      description: 'List all catalog executors associated with one provider.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Catalog provider ID.' }
      }
    }
  }
};

export const catalogTemplatesSchema = {
  resource: 'catalog-templates',
  component: 'catalog',
  description: 'Workflow templates and parameter-validation contracts from the Flowker catalog.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/catalog/templates',
      description: 'List all registered workflow templates.',
      requestHeaders: flowkerAuthHeaders
    },
    get: {
      method: 'GET',
      path: '/v1/catalog/templates/:id',
      description: 'Get template metadata and its parameter schema.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Catalog template ID.' }
      }
    },
    validateParams: {
      method: 'POST',
      path: '/v1/catalog/templates/:id/validate',
      description: 'Validate template parameters against the template JSON Schema.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Catalog template ID.' }
      },
      input: {
        params: { type: 'object', required: true, description: 'Template parameters to validate.' }
      }
    }
  }
};

export const catalogTriggersSchema = {
  resource: 'catalog-triggers',
  component: 'catalog',
  description: 'Built-in trigger definitions and JSON Schema metadata from the Flowker catalog.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/catalog/triggers',
      description: 'List all built-in trigger definitions.',
      requestHeaders: flowkerAuthHeaders
    },
    get: {
      method: 'GET',
      path: '/v1/catalog/triggers/:id',
      description: 'Get one trigger definition and its schema metadata.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Catalog trigger ID.' }
      }
    }
  }
};
