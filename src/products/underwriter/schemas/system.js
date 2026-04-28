export const underwriterSystemSchema = {
  resource: 'system',
  component: 'system',
  description: 'Underwriter health and readiness endpoints.',
  actions: {
    health: {
      method: 'GET',
      path: '/health',
      description: 'Get Underwriter liveness status.'
    },
    ready: {
      method: 'GET',
      path: '/readyz',
      description: 'Get Underwriter readiness checks, version, and deployment metadata.'
    }
  }
};
