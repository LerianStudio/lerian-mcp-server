import { listPromptMetadata } from '../prompts/registry.js';
import { listWorkflows } from '../workflows/index.js';
import { getLiveProductToolMetadata, listLiveProducts } from '../products/index.js';

export const CORE_TOOL_METADATA = [
  {
    name: 'lerian',
    kind: 'core',
    category: 'portfolio',
    description: 'Portfolio discovery, docs, learning, SDK examples, and search.',
    product: 'all'
  },
  {
    name: 'portfolio-workflow',
    kind: 'workflow',
    category: 'workflow',
    description: 'Cross-product workflow discovery, planning, and execution.',
    product: 'all'
  }
];

let runtimeSurfaceSnapshot = null;

function cloneRuntimeSurface(surface) {
  return {
    ...surface,
    tools: surface.tools.map((tool) => ({ ...tool })),
    prompts: surface.prompts.map((prompt) => ({ ...prompt })),
    workflows: surface.workflows.map((workflow) => ({ ...workflow })),
    liveProducts: surface.liveProducts.map((product) => ({
      ...product,
      liveToolNames: [...product.liveToolNames]
    })),
    liveApiPairs: surface.liveApiPairs.map((pair) => ({ ...pair }))
  };
}

export function listRuntimeToolMetadata() {
  return [...CORE_TOOL_METADATA, ...getLiveProductToolMetadata()].map((tool) => ({ ...tool }));
}

export function listLiveApiPairs() {
  const tools = getLiveProductToolMetadata();
  const grouped = new Map();

  for (const tool of tools) {
    const existing = grouped.get(tool.product) || { product: tool.product, discover: null, execute: null };
    if (tool.kind === 'discover') {
      existing.discover = tool.name;
    }
    if (tool.kind === 'execute') {
      existing.execute = tool.name;
    }
    grouped.set(tool.product, existing);
  }

  return [...grouped.values()].filter((entry) => entry.discover || entry.execute);
}

export function getRuntimeSurface() {
  if (runtimeSurfaceSnapshot) {
    return cloneRuntimeSurface(runtimeSurfaceSnapshot);
  }

  const tools = listRuntimeToolMetadata();
  const prompts = listPromptMetadata();
  const workflows = listWorkflows();

  runtimeSurfaceSnapshot = {
    toolCount: tools.length,
    promptCount: prompts.length,
    workflowCount: workflows.length,
    tools,
    prompts,
    workflows,
    liveProducts: listLiveProducts(),
    liveApiPairs: listLiveApiPairs()
  };

  return cloneRuntimeSurface(runtimeSurfaceSnapshot);
}
