#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// Node.js globals
declare const process: any;
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { initializeSecurity } from './util/security.js';
import { initializeManifest } from './util/docs-manifest.js';
import { initializeMcpLogger, createLogger, logLifecycleEvent, logConfigEvent, logLoggingConfig } from './util/mcp-logging.js';
import { globalErrorMonitor, trackAsyncOperation, ErrorSeverity } from './util/error-monitoring.js';
import { initializeSecrets, displaySecretsInfo } from './util/secret-manager.js';
import { SERVER_VERSION } from './config.js';

// Import THE unified Lerian tool (all products, all operations in ONE tool)
import { registerLerianTool } from './tools/lerian.js';
import { registerProductAdapters } from './products/index.js';
import { registerPortfolioWorkflowTool } from './tools/portfolio-workflow.js';

// Import discovery prompts
import { registerDiscoveryPrompts } from './prompts/tool-discovery.js';
import { registerWorkflowPrompts } from './prompts/midaz-workflows.js';
import { registerAdvancedPrompts } from './prompts/advanced-workflows.js';

// Resources completely removed - no subscription handlers needed

// Import client detection system
import { initializeClientDetection } from './util/client-integration.js';

/**
 * Create an MCP server for Lerian
 *
 * This server provides Model Context Protocol (MCP) access to Lerian's documentation and learning resources.
 * It offers comprehensive documentation, interactive tutorials, SDK code generation, and best practices
 * for AI assistants like Claude, ChatGPT, and others.
 *
 * @since 3.0.0 - Rebranded from Midaz to Lerian
 * @since 4.0.0 - Expanded to portfolio discovery, live product API adapters, and workflows
 */
const main = async () => {
  return await trackAsyncOperation('server_startup', async () => {
    // Initialize cryptographic secrets (auto-generate if not set)
    const secretsInfo = initializeSecrets();
    logConfigEvent('secrets_initialized', { source: secretsInfo.source });

    // Initialize silently - no console output until after MCP connection
    initializeSecurity();
    logConfigEvent('security_initialized');

    await initializeManifest();
    logConfigEvent('docs_manifest_initialized');

    const capabilities = {
      tools: {
        portfolioDiscovery: true,
        unifiedDocumentation: true,
        unifiedLearning: true,
        sdk: true,
        midazApi: true,
        fetcherApi: true,
        reporterApi: true,
        matcherApi: true,
        tracerApi: true,
        crossProductWorkflows: true,
      },
      prompts: true,
      logging: {}
    };

    const instructions = [
      'Use the lerian tool for portfolio discovery, documentation, learning, SDK examples, and search.',
      'Use the matching <product>-discover tool before calling any <product>-execute tool.',
      'Live execute tools may call external Lerian services; mutating actions require confirmMutation=true and a mutationReason.',
      'Use portfolio-workflow for cross-product flows and keep the returned sessionToken private.'
    ].join(' ');

    // Create the MCP server. Tools and prompts are advertised by SDK registration;
    // constructor capabilities are for server-level protocol features like logging.
    const server = new McpServer({
      name: 'lerian-mcp-server',
      version: SERVER_VERSION
    }, {
      capabilities: { logging: {} },
      instructions
    });

    // Initialize MCP logger
    initializeMcpLogger(server);
    logLoggingConfig();
    const logger = createLogger('server');

    // Log startup (to logger only, not console during MCP startup)
    logLifecycleEvent('starting', { version: SERVER_VERSION, capabilities });
    logger.info('Server initialization started', { version: SERVER_VERSION });

    registerLerianTool(server);
    logger.info('Unified Lerian tool registered');

    registerPortfolioWorkflowTool(server);
    logger.info('Portfolio workflow tool registered');

    const registeredProductAdapters = registerProductAdapters(server);
    for (const adapter of registeredProductAdapters) {
      logger.info(`${adapter.id} live product adapter registered`, { tools: adapter.liveToolNames });
    }

    registerDiscoveryPrompts(server);
    logger.info('Discovery prompts registered');

    registerWorkflowPrompts(server);
    logger.info('Workflow prompts registered');

    registerAdvancedPrompts(server);
    logger.info('Advanced prompts registered');

    const totalToolNames = ['lerian', 'portfolio-workflow', ...registeredProductAdapters.flatMap((adapter) => adapter.liveToolNames)];
    logger.info(`Total tools: ${totalToolNames.length} (${totalToolNames.join(', ')})`);

    // Connect to stdio transport
    const transport = new StdioServerTransport();

    await server.connect(transport);

    // Graceful shutdown handling
    let isShuttingDown = false;

    const gracefulShutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`Received ${signal}, initiating graceful shutdown...`);

      try {
        // Set timeout to force shutdown if graceful close takes too long
        const shutdownTimeout = setTimeout(() => {
          logger.error('Graceful shutdown timeout exceeded (30s), forcing exit');
          globalErrorMonitor.logError(
            new Error('Forced shutdown due to timeout'),
            ErrorSeverity.HIGH,
            { signal, timeout: 30000 }
          );
          process.exit(1);
        }, 30000); // 30 second timeout

        // Flush metrics before closing
        globalErrorMonitor.stopPeriodicFlush();

        // Close the MCP server connection (waits for in-flight requests)
        await server.close();

        // Clear timeout if shutdown completes successfully
        clearTimeout(shutdownTimeout);

        logger.info('Server closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error instanceof Error ? error : String(error));
        globalErrorMonitor.logError(
          error instanceof Error ? error : new Error(String(error)),
          ErrorSeverity.CRITICAL,
          { signal, phase: 'shutdown' }
        );
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Initialize client detection system AFTER connecting to avoid race conditions
    const clientContext = await initializeClientDetection(server);
    logger.info('Client detected and configured', {
      client: clientContext.client.name,
      capabilities: Object.keys(clientContext.capabilities).length
    });

    // Log internally only - no console output to keep stdio clean
    logLifecycleEvent('started', {
      transport: 'stdio',
      client: clientContext.client.name,
      timestamp: new Date().toISOString()
    });
    logger.info('Server ready to accept requests');

    // Display secrets information (writes to stderr, safe for MCP)
    displaySecretsInfo();
  }, {
    version: SERVER_VERSION,
    transport: 'stdio'
  });
};

// Run the main function
main().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error('❌ Fatal error in Lerian MCP Server:', errorMessage);
  if (errorStack) {
    console.error('Stack trace:', errorStack);
  }

  // Log the fatal error
  globalErrorMonitor.logError(
    error instanceof Error ? error : new Error(String(error)),
    ErrorSeverity.CRITICAL,
    {
      type: 'fatal_startup_error',
      timestamp: new Date().toISOString()
    }
  );

  process.exit(1);
});  
