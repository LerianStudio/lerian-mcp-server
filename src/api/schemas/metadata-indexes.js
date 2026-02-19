export const metadataIndexesSchema = {
  resource: 'metadata-indexes',
  component: 'ledger',
  description: 'MongoDB indexes on custom metadata fields for optimized querying (supports transaction, operation, operation_route, transaction_route entities)',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/metadata-indexes/:entityName',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        entityName: { type: 'string', required: true, description: 'Entity type: transaction, operation, operation_route, or transaction_route' },
      },
      description: 'Create a metadata index on an entity collection',
      input: {
        metadataKey: { type: 'string', required: true, description: 'Metadata key to index (max 100 chars, without "metadata." prefix)' },
        unique: { type: 'boolean', required: false, description: 'Enforce uniqueness (default false)' },
        sparse: { type: 'boolean', required: false, description: 'Only include documents with the field (default true)' },
      },
      example: { metadataKey: 'tier', unique: false, sparse: true },
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/metadata-indexes',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List all metadata indexes in a ledger (includes usage statistics)',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/metadata-indexes/:entityName/:metadataKey',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        entityName: { type: 'string', required: true, description: 'Entity type' },
        metadataKey: { type: 'string', required: true, description: 'Metadata key to remove index for' },
      },
      description: 'Delete a metadata index',
    },
  },
};
