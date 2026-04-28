import { createProductAdapter } from '../adapter.js';
import { registerMatcherDiscoverTool } from '../../tools/matcher-discover.js';
import { registerMatcherExecuteTool } from '../../tools/matcher-execute.js';

export const matcherAdapter = createProductAdapter({
  id: 'matcher',
  name: 'Matcher',
  tools: [
    {
      name: 'matcher-discover',
      kind: 'discover',
      category: 'live-api',
      description: 'Inspect Matcher contexts, sources, matching, exceptions, disputes, discovery bridge, and contracts.'
    },
    {
      name: 'matcher-execute',
      kind: 'execute',
      category: 'live-api',
      description: 'Execute Matcher API actions.'
    }
  ],
  registerTools(server) {
    registerMatcherDiscoverTool(server);
    registerMatcherExecuteTool(server);
  }
});
