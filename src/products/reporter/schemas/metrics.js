export const metricsSchema = {
  resource: 'metrics',
  component: 'metrics',
  description: 'Reporter aggregated metrics surface.',
  actions: {
    get: {
      method: 'GET',
      path: '/v1/metrics',
      description: 'Get aggregate counts for templates, reports, data sources, and error totals.',
      queryParams: {
        errorPeriodDays: { type: 'number', description: 'Error aggregation period in days (1-365).' }
      }
    }
  }
};
