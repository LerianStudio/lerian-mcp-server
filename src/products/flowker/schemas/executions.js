import { flowkerAuthHeaders, flowkerRequiredIdempotencyHeader } from './shared.js';

export const executionsSchema = {
  resource: 'executions',
  component: 'execution',
  description: 'Workflow execution lifecycle, status inspection, results retrieval, and execution start.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/executions',
      description: 'List workflow executions with workflow/status filters and cursor pagination.',
      requestHeaders: flowkerAuthHeaders,
      queryParams: {
        workflowId: { type: 'string', description: 'Filter by workflow UUID.' },
        status: { type: 'string', description: 'Filter by status: pending, running, completed, failed.' },
        limit: { type: 'number', description: 'Page size between 1 and 100. Default 10.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        sortBy: { type: 'string', description: 'Sort field: startedAt or completedAt. Default startedAt.' },
        sortOrder: { type: 'string', description: 'Sort order: ASC or DESC. Default DESC.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/executions/:id',
      description: 'Get the current status of one workflow execution.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Execution UUID.' }
      }
    },
    getResults: {
      method: 'GET',
      path: '/v1/executions/:id/results',
      description: 'Get step results and final output for a completed execution.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Execution UUID.' }
      }
    },
    start: {
      method: 'POST',
      path: '/v1/workflows/:workflowId/executions',
      description: 'Start a new workflow execution. Flowker requires Idempotency-Key for this action.',
      requestHeaders: {
        ...flowkerAuthHeaders,
        ...flowkerRequiredIdempotencyHeader
      },
      pathParams: {
        workflowId: { type: 'string', required: true, description: 'Workflow UUID to execute.' }
      },
      input: {
        inputData: { type: 'object', required: true, description: 'Workflow execution input payload.' }
      }
    }
  }
};
