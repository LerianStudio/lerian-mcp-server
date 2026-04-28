import { createProductAdapter } from '../adapter.js';
import { registerFlowkerDiscoverTool } from '../../tools/flowker-discover.js';
import { registerFlowkerExecuteTool } from '../../tools/flowker-execute.js';

export const flowkerAdapter = createProductAdapter({
  id: 'flowker',
  name: 'Flowker',
  tools: [
    {
      name: 'flowker-discover',
      kind: 'discover',
      category: 'live-api',
      description: 'Inspect Flowker catalog, workflow, execution, provider, executor, audit, dashboard, and webhook contracts.'
    },
    {
      name: 'flowker-execute',
      kind: 'execute',
      category: 'live-api',
      description: 'Execute Flowker API actions, including workflow runs and webhook triggers.'
    }
  ],
  registerTools(server) {
    registerFlowkerDiscoverTool(server);
    registerFlowkerExecuteTool(server);
  }
});
