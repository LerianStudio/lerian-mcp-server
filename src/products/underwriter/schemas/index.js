import { underwriterSystemSchema } from './system.js';
import { jurisdictionsSchema } from './jurisdictions.js';
import { loanApplicationsSchema } from './loan-applications.js';
import { loanProductsSchema } from './loan-products.js';
import { examplesSchema } from './examples.js';
import { createSchemaRegistry } from '../../schema-registry.js';

const allSchemas = [underwriterSystemSchema, jurisdictionsSchema, loanApplicationsSchema, loanProductsSchema, examplesSchema];
const registry = createSchemaRegistry(allSchemas);

export const getSchema = registry.getSchema;
export const getAllSchemas = registry.getAllSchemas;
export const getSchemasByComponent = registry.getSchemasByComponent;
export const findSchemas = registry.findSchemas;
export const listResources = registry.listResources;
