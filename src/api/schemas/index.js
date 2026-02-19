import { organizationsSchema } from './organizations.js';
import { ledgersSchema } from './ledgers.js';
import { assetsSchema } from './assets.js';
import { portfoliosSchema } from './portfolios.js';
import { segmentsSchema } from './segments.js';
import { accountsSchema } from './accounts.js';
import { accountTypesSchema } from './account-types.js';
import { transactionsSchema } from './transactions.js';
import { operationsSchema } from './operations.js';
import { balancesSchema } from './balances.js';
import { assetRatesSchema } from './asset-rates.js';
import { operationRoutesSchema } from './operation-routes.js';
import { transactionRoutesSchema } from './transaction-routes.js';
import { metadataIndexesSchema } from './metadata-indexes.js';
import { holdersSchema } from './holders.js';
import { aliasesSchema } from './aliases.js';

const allSchemas = [
  organizationsSchema,
  ledgersSchema,
  assetsSchema,
  portfoliosSchema,
  segmentsSchema,
  accountsSchema,
  accountTypesSchema,
  transactionsSchema,
  operationsSchema,
  balancesSchema,
  assetRatesSchema,
  operationRoutesSchema,
  transactionRoutesSchema,
  metadataIndexesSchema,
  holdersSchema,
  aliasesSchema,
];

const schemaMap = new Map();
for (const schema of allSchemas) {
  schemaMap.set(schema.resource, schema);
}

export function getSchema(resource) {
  return schemaMap.get(resource) || null;
}

export function getAllSchemas() {
  return allSchemas;
}

export function getSchemasByComponent(component) {
  return allSchemas.filter(s => s.component === component);
}

export function findSchemas(query) {
  const q = query.toLowerCase();
  return allSchemas.filter(s =>
    s.resource.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.component.toLowerCase().includes(q) ||
    Object.keys(s.actions).some(a => a.toLowerCase().includes(q))
  );
}

export function listResources() {
  return allSchemas.map(s => ({
    resource: s.resource,
    component: s.component,
    description: s.description,
    actions: Object.keys(s.actions),
  }));
}
