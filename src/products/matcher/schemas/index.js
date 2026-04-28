import { contextsSchema } from './contexts.js';
import { sourcesSchema } from './sources.js';
import { fieldMapsSchema } from './field-maps.js';
import { discoverySchema } from './discovery.js';
import { matchingSchema } from './matching.js';
import { exceptionsSchema } from './exceptions.js';
import { disputesSchema } from './disputes.js';
import { governanceSchema } from './governance.js';
import { reportingSchema } from './reporting.js';
import { matcherSystemSchema } from './system.js';
import { createSchemaRegistry } from '../../schema-registry.js';

const allSchemas = [
  contextsSchema,
  sourcesSchema,
  fieldMapsSchema,
  discoverySchema,
  matchingSchema,
  exceptionsSchema,
  disputesSchema,
  governanceSchema,
  reportingSchema,
  matcherSystemSchema
];

const registry = createSchemaRegistry(allSchemas);

export const getSchema = registry.getSchema;
export const getAllSchemas = registry.getAllSchemas;
export const getSchemasByComponent = registry.getSchemasByComponent;
export const findSchemas = registry.findSchemas;
export const listResources = registry.listResources;
