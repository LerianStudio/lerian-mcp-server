export const flowkerSystemSchema = {
  resource: 'system',
  component: 'system',
  description: 'Flowker health, readiness, and runtime metadata endpoints.',
  actions: {
    health: {
      method: 'GET',
      path: '/health',
      description: 'Get overall Flowker health status.'
    },
    live: {
      method: 'GET',
      path: '/health/live',
      description: 'Check liveness for container/runtime health probing.'
    },
    ready: {
      method: 'GET',
      path: '/health/ready',
      description: 'Check Flowker readiness across backing dependencies.'
    },
    version: {
      method: 'GET',
      path: '/version',
      description: 'Get the current Flowker version string.'
    }
  }
};
