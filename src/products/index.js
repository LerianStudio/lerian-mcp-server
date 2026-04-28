import { midazAdapter } from './midaz/index.js';
import { fetcherAdapter } from './fetcher/index.js';
import { reporterAdapter } from './reporter/index.js';
import { matcherAdapter } from './matcher/index.js';
import { tracerAdapter } from './tracer/index.js';
import { flowkerAdapter } from './flowker/index.js';
import { underwriterAdapter } from './underwriter/index.js';

export const LIVE_PRODUCT_ADAPTERS = [midazAdapter, fetcherAdapter, reporterAdapter, matcherAdapter, tracerAdapter, flowkerAdapter, underwriterAdapter];

export function registerProductAdapters(server) {
  for (const adapter of LIVE_PRODUCT_ADAPTERS) {
    adapter.registerTools(server);
  }

  return LIVE_PRODUCT_ADAPTERS.map((adapter) => ({
    id: adapter.id,
    name: adapter.name,
    liveToolNames: [...adapter.liveToolNames]
  }));
}

export function getLiveProductToolMetadata() {
  return LIVE_PRODUCT_ADAPTERS.flatMap((adapter) => adapter.tools.map((tool) => ({ ...tool })));
}

export function listLiveProducts() {
  return LIVE_PRODUCT_ADAPTERS.map((adapter) => ({
    id: adapter.id,
    name: adapter.name,
    liveToolNames: [...adapter.liveToolNames]
  }));
}
