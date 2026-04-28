import { flowkerAuthHeaders } from './shared.js';

export const workflowsSchema = {
  resource: 'workflows',
  component: 'workflow',
  description: 'Workflow definition lifecycle including creation, template instantiation, cloning, and status transitions.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/workflows',
      description: 'List workflows with status filters and cursor pagination.',
      requestHeaders: flowkerAuthHeaders,
      queryParams: {
        status: { type: 'string', description: 'Filter by status: draft, active, inactive.' },
        limit: { type: 'number', description: 'Page size between 1 and 100. Default 10.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        sortBy: { type: 'string', description: 'Sort field: createdAt, updatedAt, or name. Default createdAt.' },
        sortOrder: { type: 'string', description: 'Sort order: ASC or DESC. Default DESC.' }
      }
    },
    create: {
      method: 'POST',
      path: '/v1/workflows',
      description: 'Create a workflow definition in draft status.',
      requestHeaders: flowkerAuthHeaders,
      input: {
        name: { type: 'string', required: true, description: 'Workflow name.' },
        description: { type: 'string', required: false, description: 'Optional workflow description.' },
        metadata: { type: 'object', required: false, description: 'Optional workflow metadata.' },
        nodes: { type: 'array', required: false, description: 'Workflow nodes. Each item includes id, type, position, optional name, and data.' },
        edges: { type: 'array', required: false, description: 'Workflow edges. Each item includes id, source, target, and optional condition/label/sourceHandle.' }
      }
    },
    createFromTemplate: {
      method: 'POST',
      path: '/v1/workflows/from-template',
      description: 'Create a workflow from a catalog template plus parameter values.',
      requestHeaders: flowkerAuthHeaders,
      input: {
        templateId: { type: 'string', required: true, description: 'Catalog template ID.' },
        params: { type: 'object', required: true, description: 'Template parameters object.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/workflows/:id',
      description: 'Get one workflow definition by ID.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Workflow UUID.' }
      }
    },
    update: {
      method: 'PUT',
      path: '/v1/workflows/:id',
      description: 'Update a workflow definition. Flowker allows this while the workflow is in draft status.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Workflow UUID.' }
      },
      input: {
        name: { type: 'string', required: true, description: 'Updated workflow name.' },
        description: { type: 'string', required: false, description: 'Updated workflow description.' },
        metadata: { type: 'object', required: false, description: 'Updated workflow metadata.' },
        nodes: { type: 'array', required: false, description: 'Updated workflow nodes.' },
        edges: { type: 'array', required: false, description: 'Updated workflow edges.' }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/workflows/:id',
      description: 'Delete a workflow definition when it is in a deletable state.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Workflow UUID.' }
      }
    },
    activate: {
      method: 'POST',
      path: '/v1/workflows/:id/activate',
      description: 'Transition a workflow from draft to active status.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Workflow UUID.' }
      }
    },
    clone: {
      method: 'POST',
      path: '/v1/workflows/:id/clone',
      description: 'Clone a workflow into a new draft with a new name.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Source workflow UUID.' }
      },
      input: {
        name: { type: 'string', required: true, description: 'Name for the cloned workflow.' }
      }
    },
    deactivate: {
      method: 'POST',
      path: '/v1/workflows/:id/deactivate',
      description: 'Transition a workflow from active to inactive status.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Workflow UUID.' }
      }
    },
    moveToDraft: {
      method: 'POST',
      path: '/v1/workflows/:id/draft',
      description: 'Move an inactive workflow back to draft status for editing.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Workflow UUID.' }
      }
    }
  }
};
