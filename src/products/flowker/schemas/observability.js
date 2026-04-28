import { flowkerAuthHeaders } from './shared.js';

export const dashboardsSchema = {
  resource: 'dashboards',
  component: 'observability',
  description: 'Aggregated execution and workflow summaries for Flowker operations monitoring.',
  actions: {
    getExecutionSummary: {
      method: 'GET',
      path: '/v1/dashboards/executions',
      description: 'Get aggregate execution counts for a time range and optional status filter.',
      requestHeaders: flowkerAuthHeaders,
      queryParams: {
        startTime: { type: 'string', description: 'RFC3339 start time filter.' },
        endTime: { type: 'string', description: 'RFC3339 end time filter.' },
        status: { type: 'string', description: 'Optional execution status filter: pending, running, completed, failed.' }
      }
    },
    getWorkflowSummary: {
      method: 'GET',
      path: '/v1/dashboards/workflows/summary',
      description: 'Get aggregated workflow counts grouped by status.',
      requestHeaders: flowkerAuthHeaders
    }
  }
};

export const auditEventsSchema = {
  resource: 'audit-events',
  component: 'observability',
  description: 'Immutable audit log search, event inspection, and hash-chain verification.',
  actions: {
    list: {
      method: 'GET',
      path: '/v1/audit-events',
      description: 'Search audit entries with filters for event type, action, result, resource, and date range.',
      requestHeaders: flowkerAuthHeaders,
      queryParams: {
        eventType: { type: 'string', description: 'Filter by event type.' },
        action: { type: 'string', description: 'Filter by action.' },
        result: { type: 'string', description: 'Filter by result: SUCCESS or FAILED.' },
        resourceType: { type: 'string', description: 'Filter by resource type: workflow, execution, provider_config.' },
        resourceId: { type: 'string', description: 'Filter by resource UUID.' },
        dateFrom: { type: 'string', description: 'RFC3339 start date filter.' },
        dateTo: { type: 'string', description: 'RFC3339 end date filter.' },
        limit: { type: 'number', description: 'Page size between 1 and 100. Default 20.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        sortOrder: { type: 'string', description: 'Sort order: ASC or DESC. Default DESC.' }
      }
    },
    get: {
      method: 'GET',
      path: '/v1/audit-events/:id',
      description: 'Get one audit event by event ID.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Audit event UUID.' }
      }
    },
    verifyHashChain: {
      method: 'GET',
      path: '/v1/audit-events/:id/verify',
      description: 'Verify the audit hash-chain up to one event ID.',
      requestHeaders: flowkerAuthHeaders,
      pathParams: {
        id: { type: 'string', required: true, description: 'Audit event UUID.' }
      }
    }
  }
};
