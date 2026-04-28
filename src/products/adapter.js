export function createProductAdapter({ id, name, liveToolNames, tools, registerTools }) {
  const normalizedTools = Array.isArray(tools)
    ? tools.map((tool) => ({ ...tool, product: tool.product || id }))
    : [];

  return {
    id,
    name,
    liveToolNames: Array.isArray(liveToolNames)
      ? [...liveToolNames]
      : normalizedTools.map((tool) => tool.name),
    tools: normalizedTools,
    registerTools(server) {
      registerTools(server);
    }
  };
}
