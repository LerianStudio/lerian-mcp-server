import { flowkerSystemSchema } from './system.js';
import { catalogExecutorsSchema, catalogProvidersSchema, catalogTemplatesSchema, catalogTriggersSchema } from './catalog.js';
import { dashboardsSchema, auditEventsSchema } from './observability.js';
import { executionsSchema } from './executions.js';
import { executorConfigurationsSchema, providerConfigurationsSchema } from './configurations.js';
import { workflowsSchema } from './workflows.js';
import { webhooksSchema } from './webhooks.js';
import { createSchemaRegistry } from '../../schema-registry.js';

const allSchemas = [
  flowkerSystemSchema,
  catalogExecutorsSchema,
  catalogProvidersSchema,
  catalogTemplatesSchema,
  catalogTriggersSchema,
  dashboardsSchema,
  auditEventsSchema,
  executionsSchema,
  executorConfigurationsSchema,
  providerConfigurationsSchema,
  workflowsSchema,
  webhooksSchema
];

const registry = createSchemaRegistry(allSchemas);

export const getSchema = registry.getSchema;
export const getAllSchemas = registry.getAllSchemas;
export const getSchemasByComponent = registry.getSchemasByComponent;
export const findSchemas = registry.findSchemas;
export const listResources = registry.listResources;
