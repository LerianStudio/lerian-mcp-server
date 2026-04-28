export const matcherSystemSchema = {
  resource: 'system',
  component: 'operations',
  description: 'Matcher operational endpoints for health, readiness, and version.',
  actions: {
    health: {
      method: 'GET',
      path: '/health',
      description: 'Liveness endpoint.',
      responseType: 'text'
    },
    readyz: {
      method: 'GET',
      path: '/readyz',
      description: 'Readiness endpoint.'
    },
    version: {
      method: 'GET',
      path: '/version',
      description: 'Version endpoint.'
    }
  }
};
