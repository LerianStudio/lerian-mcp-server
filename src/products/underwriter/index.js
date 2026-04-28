import { createProductAdapter } from '../adapter.js';
import { registerUnderwriterDiscoverTool } from '../../tools/underwriter-discover.js';
import { registerUnderwriterExecuteTool } from '../../tools/underwriter-execute.js';

export const underwriterAdapter = createProductAdapter({
  id: 'underwriter',
  name: 'Underwriter',
  tools: [
    {
      name: 'underwriter-discover',
      kind: 'discover',
      category: 'live-api',
      description: 'Inspect Underwriter jurisdictions, loan products, schedule preview, and sample example contracts.'
    },
    {
      name: 'underwriter-execute',
      kind: 'execute',
      category: 'live-api',
      description: 'Execute Underwriter API actions for loan product and schedule-preview workflows.'
    }
  ],
  registerTools(server) {
    registerUnderwriterDiscoverTool(server);
    registerUnderwriterExecuteTool(server);
  }
});
