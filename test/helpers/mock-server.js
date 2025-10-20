/**
 * Mock MCP Server for testing
 */

export class MockMcpServer {
  constructor() {
    this.tools = new Map();
    this.prompts = new Map();
    this.requestHandlers = new Map();
  }

  tool(name, description, schema, handler) {
    this.tools.set(name, {
      name,
      description,
      schema,
      handler
    });
  }

  prompt(name, description, schema, handler) {
    this.prompts.set(name, {
      name,
      description,
      schema,
      handler
    });
  }

  setRequestHandler(schema, handler) {
    this.requestHandlers.set(schema, handler);
  }

  async invokeTool(name, args) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return await tool.handler(args, {});
  }

  async invokePrompt(name, args) {
    const prompt = this.prompts.get(name);
    if (!prompt) {
      throw new Error(`Prompt not found: ${name}`);
    }
    return await prompt.handler(args);
  }

  getTools() {
    return Array.from(this.tools.values());
  }

  getPrompts() {
    return Array.from(this.prompts.values());
  }
}

export function createMockServer() {
  return new MockMcpServer();
}
