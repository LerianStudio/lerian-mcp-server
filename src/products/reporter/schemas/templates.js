export const templatesSchema = {
  resource: 'templates',
  component: 'templates',
  description: 'Reporter template management, including template builder helpers and template CRUD.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/templates',
      description: 'List templates with pagination.',
      queryParams: {
        limit: { type: 'number', description: 'Page size (default 10).' },
        page: { type: 'number', description: 'Page number (default 1).' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/templates',
      description: 'Create a template from multipart form upload.',
      bodyType: 'multipart',
      requestHeaders: {
        'X-Idempotency': { required: false, description: 'Optional idempotency key for duplicate protection.' }
      },
      input: {
        template: { type: 'file', required: true, description: 'Template file upload. Provide multipart.template = { filename, content, contentType?, encoding? }.' },
        outputFormat: { type: 'string', required: true, description: 'Output format (html, pdf, txt, xml).' },
        description: { type: 'string', required: false, description: 'Template description.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/templates/:id',
      description: 'Get one template by ID.',
      pathParams: {
        id: { type: 'string', required: true, description: 'Template UUID.' }
      }
    },
    update: {
      method: 'PATCH',
      path: '/v1/templates/:id',
      description: 'Update a template by ID using multipart form fields.',
      bodyType: 'multipart',
      pathParams: {
        id: { type: 'string', required: true, description: 'Template UUID.' }
      },
      input: {
        template: { type: 'file', required: false, description: 'Optional replacement template file.' },
        outputFormat: { type: 'string', required: false, description: 'Updated output format.' },
        description: { type: 'string', required: false, description: 'Updated description.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/templates/:id',
      description: 'Delete a template by ID.',
      pathParams: {
        id: { type: 'string', required: true, description: 'Template UUID.' }
      }
    },
    getBlocksConfig: {
      method: 'GET',
      path: '/v1/templates/blocks-config',
      description: 'List template-builder block definitions.'
    },
    getFilters: {
      method: 'GET',
      path: '/v1/templates/filters',
      description: 'List template-builder filter definitions.'
    },
    generateCode: {
      method: 'POST',
      path: '/v1/templates/generate-code',
      description: 'Generate Pongo2 code and mapped fields from a JSON block tree.',
      input: {
        blocks: { type: 'array', required: true, description: 'Template block tree.' },
        format: { type: 'string', required: false, description: 'Optional output format for generation.' }
      }
    },
    validateBlocks: {
      method: 'POST',
      path: '/v1/templates/validate',
      description: 'Validate a JSON block tree before template generation.',
      input: {
        blocks: { type: 'array', required: true, description: 'Template block tree to validate.' }
      }
    }
  }
};
