import { createProductAdapter } from '../adapter.js';
import { registerFetcherDiscoverTool } from '../../tools/fetcher-discover.js';
import { registerFetcherExecuteTool } from '../../tools/fetcher-execute.js';

export const fetcherAdapter = createProductAdapter({
  id: 'fetcher',
  name: 'Fetcher',
  tools: [
    {
      name: 'fetcher-discover',
      kind: 'discover',
      category: 'live-api',
      description: 'Inspect Fetcher connections, migrations, jobs, and their contracts.'
    },
    {
      name: 'fetcher-execute',
      kind: 'execute',
      category: 'live-api',
      description: 'Execute Fetcher manager API actions.'
    }
  ],
  registerTools(server) {
    registerFetcherDiscoverTool(server);
    registerFetcherExecuteTool(server);
  }
});
