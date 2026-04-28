import { createProductAdapter } from '../adapter.js';
import { registerTracerDiscoverTool } from '../../tools/tracer-discover.js';
import { registerTracerExecuteTool } from '../../tools/tracer-execute.js';

export const tracerAdapter = createProductAdapter({
  id: 'tracer',
  name: 'Tracer',
  tools: [
    {
      name: 'tracer-discover',
      kind: 'discover',
      category: 'live-api',
      description: 'Inspect Tracer rules, limits, validations, audit events, and contracts.'
    },
    {
      name: 'tracer-execute',
      kind: 'execute',
      category: 'live-api',
      description: 'Execute Tracer API actions.'
    }
  ],
  registerTools(server) {
    registerTracerDiscoverTool(server);
    registerTracerExecuteTool(server);
  }
});
