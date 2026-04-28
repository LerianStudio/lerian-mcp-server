export const systemSchema = {
  resource: 'system',
  component: 'operations',
  description: 'Reporter operational health and version endpoints.',
  actions: {
    health: {
      method: 'GET',
      path: '/health',
      description: 'Simple health check endpoint.'
    },
    ready: {
      method: 'GET',
      path: '/ready',
      description: 'Dependency readiness endpoint.'
    },
    version: {
      method: 'GET',
      path: '/version',
      description: 'Version endpoint.'
    }
  }
};
