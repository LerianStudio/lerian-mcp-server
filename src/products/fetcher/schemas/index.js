import { connectionsSchema } from './connections.js';
import { connectionMigrationsSchema } from './connection-migrations.js';
import { fetcherJobsSchema } from './fetcher-jobs.js';
import { createSchemaRegistry } from '../../schema-registry.js';

const allSchemas = [connectionsSchema, connectionMigrationsSchema, fetcherJobsSchema];
const registry = createSchemaRegistry(allSchemas);

export const getSchema = registry.getSchema;
export const getAllSchemas = registry.getAllSchemas;
export const getSchemasByComponent = registry.getSchemasByComponent;
export const findSchemas = registry.findSchemas;
export const listResources = registry.listResources;
