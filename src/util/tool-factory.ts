/**
 * Tool Factory for CRUD Operations
 * Reduces code duplication by generating standard CRUD tools
 */

import { z } from 'zod';
import { commonSchemas, createListSchema, createGetSchema, createCreateSchema, createUpdateSchema, createDeleteSchema } from './validation.js';

export interface CrudOperation {
  name: string;
  description: string;
  schema: z.ZodSchema;
  handler: (args: any) => Promise<any>;
}

export interface CrudToolConfig {
  resource: string;
  resourcePlural: string;
  operations: ('list' | 'get' | 'create' | 'update' | 'delete')[];
  createFields?: z.ZodRawShape;
  updateFields?: z.ZodRawShape;
  customHandlers?: {
    list?: (args: any) => Promise<any>;
    get?: (args: any) => Promise<any>;
    create?: (args: any) => Promise<any>;
    update?: (args: any) => Promise<any>;
    delete?: (args: any) => Promise<any>;
  };
  requiresLedger?: boolean;
}

/**
 * Generate CRUD operations for a resource
 */
export function createCrudOperations(config: CrudToolConfig): CrudOperation[] {
  const operations: CrudOperation[] = [];
  const { resource, resourcePlural, requiresLedger = true } = config;

  if (config.operations.includes('list')) {
    operations.push({
      name: `list-${resourcePlural}`,
      description: `List all ${resourcePlural} in an organization${requiresLedger ? ' and ledger' : ''}`,
      schema: createListSchema(resource),
      handler: config.customHandlers?.list || defaultListHandler(resource)
    });
  }

  if (config.operations.includes('get')) {
    operations.push({
      name: `get-${resource}`,
      description: `Get a specific ${resource} by ID`,
      schema: createGetSchema(resource),
      handler: config.customHandlers?.get || defaultGetHandler(resource)
    });
  }

  if (config.operations.includes('create')) {
    const createFields = config.createFields || {
      name: commonSchemas.name,
      description: commonSchemas.description,
      code: commonSchemas.code,
      metadata: commonSchemas.metadata
    };

    operations.push({
      name: `create-${resource}`,
      description: `Create a new ${resource}`,
      schema: createCreateSchema(resource, createFields),
      handler: config.customHandlers?.create || defaultCreateHandler(resource)
    });
  }

  if (config.operations.includes('update')) {
    const updateFields = config.updateFields || {
      name: commonSchemas.name.optional(),
      description: commonSchemas.description,
      metadata: commonSchemas.metadata
    };

    operations.push({
      name: `update-${resource}`,
      description: `Update an existing ${resource}`,
      schema: createUpdateSchema(resource, updateFields),
      handler: config.customHandlers?.update || defaultUpdateHandler(resource)
    });
  }

  if (config.operations.includes('delete')) {
    operations.push({
      name: `delete-${resource}`,
      description: `Delete a ${resource}`,
      schema: createDeleteSchema(resource),
      handler: config.customHandlers?.delete || defaultDeleteHandler(resource)
    });
  }

  return operations;
}

/**
 * Default list handler
 */
function defaultListHandler(resource: string) {
  return async (args: any) => {
    return {
      content: [
        {
          type: 'text',
          text: `Listing ${resource}s with args: ${JSON.stringify(args, null, 2)}`
        }
      ]
    };
  };
}

/**
 * Default get handler
 */
function defaultGetHandler(resource: string) {
  return async (args: any) => {
    return {
      content: [
        {
          type: 'text',
          text: `Getting ${resource} with ID: ${args.id}`
        }
      ]
    };
  };
}

/**
 * Default create handler
 */
function defaultCreateHandler(resource: string) {
  return async (args: any) => {
    return {
      content: [
        {
          type: 'text',
          text: `Creating ${resource} with args: ${JSON.stringify(args, null, 2)}`
        }
      ]
    };
  };
}

/**
 * Default update handler
 */
function defaultUpdateHandler(resource: string) {
  return async (args: any) => {
    return {
      content: [
        {
          type: 'text',
          text: `Updating ${resource} ${args.id} with args: ${JSON.stringify(args, null, 2)}`
        }
      ]
    };
  };
}

/**
 * Default delete handler
 */
function defaultDeleteHandler(resource: string) {
  return async (args: any) => {
    return {
      content: [
        {
          type: 'text',
          text: `Deleting ${resource} with ID: ${args.id}`
        }
      ]
    };
  };
}

/**
 * Register CRUD operations with MCP server
 */
export function registerCrudOperations(
  server: any,
  operations: CrudOperation[]
): void {
  for (const operation of operations) {
    server.tool(
      operation.name,
      operation.description,
      operation.schema,
      operation.handler
    );
  }
}

/**
 * Example usage:
 * 
 * const organizationOps = createCrudOperations({
 *   resource: 'organization',
 *   resourcePlural: 'organizations',
 *   operations: ['list', 'get', 'create', 'update', 'delete'],
 *   requiresLedger: false,
 *   customHandlers: {
 *     list: async (args) => { ... },
 *     create: async (args) => { ... }
 *   }
 * });
 * 
 * registerCrudOperations(server, organizationOps);
 */
