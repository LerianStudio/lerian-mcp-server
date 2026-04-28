export const tracerSystemSchema = {
  resource: 'system',
  component: 'operations',
  description: 'Tracer operational endpoints for health, readiness, and version.',
  actions: {
    health: {
      method: 'GET',
      path: '/health',
      description: 'Liveness check endpoint.',
      responseType: 'text'
    },
    ready: {
      method: 'GET',
      path: '/ready',
      description: 'Readiness check endpoint.'
    },
    version: {
      method: 'GET',
      path: '/version',
      description: 'Version endpoint.'
    }
  }
};
