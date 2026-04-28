import { templatesSchema } from './templates.js';
import { reportsSchema } from './reports.js';
import { dataSourcesSchema } from './data-sources.js';
import { deadlinesSchema } from './deadlines.js';
import { metricsSchema } from './metrics.js';
import { systemSchema } from './system.js';
import { createSchemaRegistry } from '../../schema-registry.js';

const allSchemas = [templatesSchema, reportsSchema, dataSourcesSchema, deadlinesSchema, metricsSchema, systemSchema];
const registry = createSchemaRegistry(allSchemas);

export const getSchema = registry.getSchema;
export const getAllSchemas = registry.getAllSchemas;
export const getSchemasByComponent = registry.getSchemasByComponent;
export const findSchemas = registry.findSchemas;
export const listResources = registry.listResources;
