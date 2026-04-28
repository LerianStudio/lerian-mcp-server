export const matchingSchema = {
  resource: 'matching',
  component: 'matching',
  description: 'Matcher run orchestration, manual matching, run inspection, and match-group management.',
  actions: {
    runContext: {
      method: 'POST',
      path: '/v1/matching/contexts/:contextId/run',
      description: 'Trigger a matching run for a context in DRY_RUN or COMMIT mode.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      },
      input: {
        mode: { type: 'string', required: true, description: 'Run mode: DRY_RUN or COMMIT.' }
      }
    },
    listRuns: {
      method: 'GET',
      path: '/v1/matching/contexts/:contextId/runs',
      description: 'List match runs for a context.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      },
      queryParams: {
        limit: { type: 'number', description: 'Maximum number of records.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        sort_order: { type: 'string', description: 'Sort order: asc or desc.' }
      }
    },
    getRun: {
      method: 'GET',
      path: '/v1/matching/runs/:runId',
      description: 'Get one match run by runId.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        runId: { type: 'string', required: true, description: 'Run UUID.' }
      },
      queryParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID owning the run.' }
      }
    },
    listRunGroups: {
      method: 'GET',
      path: '/v1/matching/runs/:runId/groups',
      description: 'List match groups for a run.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        runId: { type: 'string', required: true, description: 'Run UUID.' }
      },
      queryParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID owning the run.' },
        limit: { type: 'number', description: 'Maximum number of records.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        sort_order: { type: 'string', description: 'Sort order: asc or desc.' },
        sort_by: { type: 'string', description: 'Sort field.' }
      }
    },
    manualMatch: {
      method: 'POST',
      path: '/v1/matching/manual',
      description: 'Create a manual match group for multiple transactions.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      queryParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      },
      input: {
        transactionIds: { type: 'array', required: true, description: 'At least two transaction IDs to match manually.' },
        notes: { type: 'string', required: false, description: 'Optional notes for the manual match.' }
      }
    },
    unmatchGroup: {
      method: 'DELETE',
      path: '/v1/matching/groups/:matchGroupId',
      description: 'Break an incorrect match group.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        matchGroupId: { type: 'string', required: true, description: 'Match group UUID.' }
      },
      queryParams: {
        contextId: { type: 'string', required: true, description: 'Context UUID.' }
      },
      input: {
        reason: { type: 'string', required: true, description: 'Reason for unmatching the group.' }
      }
    }
  }
};
