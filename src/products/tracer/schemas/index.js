import { rulesSchema } from './rules.js';
import { limitsSchema } from './limits.js';
import { validationsSchema } from './validations.js';
import { auditEventsSchema } from './audit-events.js';
import { tracerSystemSchema } from './system.js';
import { createSchemaRegistry } from '../../schema-registry.js';

const allSchemas = [rulesSchema, limitsSchema, validationsSchema, auditEventsSchema, tracerSystemSchema];
const registry = createSchemaRegistry(allSchemas);

export const getSchema = registry.getSchema;
export const getAllSchemas = registry.getAllSchemas;
export const getSchemasByComponent = registry.getSchemasByComponent;
export const findSchemas = registry.findSchemas;
export const listResources = registry.listResources;
