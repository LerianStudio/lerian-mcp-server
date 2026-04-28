import { createProductAdapter } from '../adapter.js';
import { registerReporterDiscoverTool } from '../../tools/reporter-discover.js';
import { registerReporterExecuteTool } from '../../tools/reporter-execute.js';

export const reporterAdapter = createProductAdapter({
  id: 'reporter',
  name: 'Reporter',
  tools: [
    {
      name: 'reporter-discover',
      kind: 'discover',
      category: 'live-api',
      description: 'Inspect Reporter templates, reports, deadlines, data sources, and contracts.'
    },
    {
      name: 'reporter-execute',
      kind: 'execute',
      category: 'live-api',
      description: 'Execute Reporter manager API actions, including multipart upload and report download.'
    }
  ],
  registerTools(server) {
    registerReporterDiscoverTool(server);
    registerReporterExecuteTool(server);
  }
});
