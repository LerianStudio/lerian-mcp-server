import { createProductAdapter } from '../adapter.js';
import { registerDiscoverTool } from '../../tools/midaz-discover.js';
import { registerExecuteTool } from '../../tools/midaz-execute.js';

export const midazAdapter = createProductAdapter({
  id: 'midaz',
  name: 'Midaz',
  tools: [
    {
      name: 'midaz-discover',
      kind: 'discover',
      category: 'live-api',
      description: 'Inspect Midaz resources, actions, and schemas across the onboarding, transaction, CRM, and ledger components.'
    },
    {
      name: 'midaz-execute',
      kind: 'execute',
      category: 'live-api',
      description: 'Execute Midaz ledger API actions.'
    }
  ],
  registerTools(server) {
    registerDiscoverTool(server);
    registerExecuteTool(server);
  }
});
