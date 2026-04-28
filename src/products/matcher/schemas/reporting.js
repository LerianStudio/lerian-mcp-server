const requestIdHeader = {
  'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
};

const contextPathParams = {
  contextId: { type: 'string', required: true, description: 'Context UUID.' }
};

const dateWindowQueryParams = {
  date_from: { type: 'string', required: true, description: 'Start date (YYYY-MM-DD).' },
  date_to: { type: 'string', required: true, description: 'End date (YYYY-MM-DD).' },
  source_id: { type: 'string', description: 'Optional source ID filter.' }
};

export const reportingSchema = {
  resource: 'reporting',
  component: 'reporting',
  description: 'Matcher reporting APIs for dashboard analytics, list reports, counts, and exports.',
  actions: {
    getDashboard: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/dashboard',
      description: 'Get combined dashboard aggregates.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    getCashImpact: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/dashboard/cash-impact',
      description: 'Get unreconciled cash impact summary.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    getMatchRate: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/dashboard/match-rate',
      description: 'Get match rate statistics and trends.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    getMetrics: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/dashboard/metrics',
      description: 'Get comprehensive dashboard metrics.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    getSLA: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/dashboard/sla',
      description: 'Get SLA statistics.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    getSourceBreakdown: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/dashboard/source-breakdown',
      description: 'Get per-source reconciliation breakdown.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    getVolume: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/dashboard/volume',
      description: 'Get transaction volume statistics.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    countExceptions: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/exceptions/count',
      description: 'Count exceptions in the reporting window.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    getMatched: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/matched',
      description: 'Get paginated matched transactions.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: {
        ...dateWindowQueryParams,
        cursor: { type: 'string', description: 'Pagination cursor.' },
        limit: { type: 'number', description: 'Maximum number of records.' },
        sort_order: { type: 'string', description: 'Sort order: asc or desc.' }
      }
    },
    exportMatched: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/matched/export',
      description: 'Export matched transactions report as CSV or PDF.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: {
        ...dateWindowQueryParams,
        format: { type: 'string', description: 'Export format: csv or pdf.' }
      },
      responseType: 'binary'
    },
    countMatches: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/matches/count',
      description: 'Count matched records in the reporting window.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    getSummary: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/summary',
      description: 'Get reconciliation summary statistics.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    exportSummary: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/summary/export',
      description: 'Export summary report as CSV or PDF.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: {
        ...dateWindowQueryParams,
        format: { type: 'string', description: 'Export format: csv or pdf.' }
      },
      responseType: 'binary'
    },
    countTransactions: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/transactions/count',
      description: 'Count total transactions in the reporting window.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    getUnmatched: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/unmatched',
      description: 'Get paginated unmatched transactions.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: {
        ...dateWindowQueryParams,
        cursor: { type: 'string', description: 'Pagination cursor.' },
        limit: { type: 'number', description: 'Maximum number of records.' },
        sort_order: { type: 'string', description: 'Sort order: asc or desc.' }
      }
    },
    countUnmatched: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/unmatched/count',
      description: 'Count unmatched records in the reporting window.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: dateWindowQueryParams
    },
    exportUnmatched: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/unmatched/export',
      description: 'Export unmatched transactions report as CSV or PDF.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: {
        ...dateWindowQueryParams,
        format: { type: 'string', description: 'Export format: csv or pdf.' }
      },
      responseType: 'binary'
    },
    getVariance: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/variance',
      description: 'Get paginated variance report rows.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: {
        ...dateWindowQueryParams,
        cursor: { type: 'string', description: 'Pagination cursor.' },
        limit: { type: 'number', description: 'Maximum number of records.' },
        sort_order: { type: 'string', description: 'Sort order: asc or desc.' }
      }
    },
    exportVariance: {
      method: 'GET',
      path: '/v1/reports/contexts/:contextId/variance/export',
      description: 'Export variance report as CSV or PDF.',
      requestHeaders: requestIdHeader,
      pathParams: contextPathParams,
      queryParams: {
        ...dateWindowQueryParams,
        format: { type: 'string', description: 'Export format: csv or pdf.' }
      },
      responseType: 'binary'
    }
  }
};
