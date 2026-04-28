import { underwriterProtectedHeaders } from './shared.js';

export const examplesSchema = {
  resource: 'examples',
  component: 'examples',
  description: 'Sample/example endpoints mounted by Underwriter for demonstration and integration exercises.',
  actions: {
    list: {
      method: 'GET',
      path: '/api/v1/examples',
      description: 'List example records with limit/offset pagination.',
      requestHeaders: underwriterProtectedHeaders,
      queryParams: {
        limit: { type: 'number', description: 'Page size. Default 20, maximum 100.' },
        offset: { type: 'number', description: 'Offset for pagination. Negative values are coerced to 0.' }
      }
    },
    create: {
      method: 'POST',
      path: '/api/v1/examples',
      description: 'Create an example record.',
      requestHeaders: underwriterProtectedHeaders,
      input: {
        name: { type: 'string', required: true, description: 'Example name.' },
        description: { type: 'string', required: false, description: 'Optional example description.' }
      }
    },
    get: {
      method: 'GET',
      path: '/api/v1/examples/:id',
      description: 'Get one example by ID.',
      requestHeaders: underwriterProtectedHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Example UUID.' }
      }
    },
    getStatus: {
      method: 'GET',
      path: '/api/v1/examples/:id/status',
      description: 'Get one example plus external status information.',
      requestHeaders: underwriterProtectedHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Example UUID.' }
      }
    }
  }
};
