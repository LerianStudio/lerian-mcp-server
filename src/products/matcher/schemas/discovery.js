export const discoverySchema = {
  resource: 'discovery',
  component: 'discovery',
  description: 'Matcher discovery bridge over Fetcher connections, schemas, and extraction requests.',
  actions: {
    refresh: {
      method: 'POST',
      path: '/v1/discovery/refresh',
      description: 'Force an immediate sync with Fetcher to refresh connections and schemas.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      }
    },
    getStatus: {
      method: 'GET',
      path: '/v1/discovery/status',
      description: 'Get current Fetcher integration status from Matcher.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      }
    },
    listConnections: {
      method: 'GET',
      path: '/v1/discovery/connections',
      description: 'List discovered Fetcher connections.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      }
    },
    getConnection: {
      method: 'GET',
      path: '/v1/discovery/connections/:connectionId',
      description: 'Get one discovered connection by ID.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        connectionId: { type: 'string', required: true, description: 'Discovered connection UUID.' }
      }
    },
    getConnectionSchema: {
      method: 'GET',
      path: '/v1/discovery/connections/:connectionId/schema',
      description: 'Get the discovered schema for a connection.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        connectionId: { type: 'string', required: true, description: 'Discovered connection UUID.' }
      }
    },
    testConnection: {
      method: 'POST',
      path: '/v1/discovery/connections/:connectionId/test',
      description: 'Test connectivity for a discovered connection.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        connectionId: { type: 'string', required: true, description: 'Discovered connection UUID.' }
      }
    },
    startExtraction: {
      method: 'POST',
      path: '/v1/discovery/connections/:connectionId/extractions',
      description: 'Start an extraction request through Matcher, which submits it to Fetcher.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        connectionId: { type: 'string', required: true, description: 'Discovered connection UUID.' }
      },
      input: {
        tables: { type: 'object', required: true, description: 'Map of table names to requested columns.' },
        filters: { type: 'object', required: false, description: 'Optional extraction filters.' },
        startDate: { type: 'string', required: false, description: 'Optional extraction start date.' },
        endDate: { type: 'string', required: false, description: 'Optional extraction end date.' }
      }
    },
    getExtraction: {
      method: 'GET',
      path: '/v1/discovery/extractions/:extractionId',
      description: 'Get a discovery extraction request by ID.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        extractionId: { type: 'string', required: true, description: 'Extraction UUID.' }
      }
    },
    pollExtraction: {
      method: 'POST',
      path: '/v1/discovery/extractions/:extractionId/poll',
      description: 'Poll Fetcher for the latest extraction status and persist any transition.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      pathParams: {
        extractionId: { type: 'string', required: true, description: 'Extraction UUID.' }
      }
    },
    listBridgeCandidates: {
      method: 'GET',
      path: '/v1/discovery/extractions/bridge/candidates',
      description: 'List bridge candidates by readiness state.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      },
      queryParams: {
        state: { type: 'string', required: true, description: 'Readiness state: pending, ready, stale, failed, in_flight.' },
        cursor: { type: 'string', description: 'Pagination cursor.' },
        limit: { type: 'number', description: 'Page size.' }
      }
    },
    getBridgeSummary: {
      method: 'GET',
      path: '/v1/discovery/extractions/bridge/summary',
      description: 'Get aggregate Fetcher bridge readiness counts.',
      requestHeaders: {
        'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
      }
    }
  }
};
