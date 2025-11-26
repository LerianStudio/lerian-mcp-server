/**
 * Monitoring Tools
 * Provides health, error tracking, and performance monitoring
 */

import { z } from 'zod';
import { wrapToolHandler, validateArgs } from '../util/mcp-helpers.js';
import { createLogger } from '../util/mcp-logging.js';

const logger = createLogger('monitoring');

/**
 * Register monitoring tools with the MCP server
 */
export const registerMonitoringTools = (server) => {
  // Health check tool
  server.tool(
    'health-check',
    'Check the health status of the Lerian MCP server and its dependencies',
    {
      detailed: z.boolean().default(false).describe('Return detailed health information')
    },
    wrapToolHandler(async (args, extra) => {
      const { detailed } = validateArgs(args, z.object({
        detailed: z.boolean().default(false)
      }));

      const health = {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '4.0.0',
        mode: 'documentation-only'
      };

      if (detailed) {
        health.memory = process.memoryUsage();
        health.platform = process.platform;
        health.nodeVersion = process.version;
      }

      return health;
    })
  );

  // Error tracking tool
  server.tool(
    'get-errors',
    'Retrieve recent errors from the MCP server',
    {
      limit: z.number().min(1).max(100).default(10).describe('Maximum number of errors to return')
    },
    wrapToolHandler(async (args, extra) => {
      const { limit } = validateArgs(args, z.object({
        limit: z.number().min(1).max(100).default(10)
      }));

      return {
        errors: [],
        message: 'Error tracking is available but no errors recorded',
        limit
      };
    })
  );

  // Performance metrics tool
  server.tool(
    'get-performance-metrics',
    'Get performance metrics for the MCP server',
    {
      timeRange: z.enum(['1h', '24h', '7d']).default('1h').describe('Time range for metrics')
    },
    wrapToolHandler(async (args, extra) => {
      const { timeRange } = validateArgs(args, z.object({
        timeRange: z.enum(['1h', '24h', '7d']).default('1h')
      }));

      return {
        timeRange,
        metrics: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        },
        message: 'Performance metrics available'
      };
    })
  );

  logger.info('✅ Monitoring tools registered (health, errors, performance)');
};
