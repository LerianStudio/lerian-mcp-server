export const assetRatesSchema = {
  resource: 'asset-rates',
  component: 'transaction',
  description: 'Currency/asset conversion rates for cross-asset transactions',
  actions: {
    createOrUpdate: {
      method: 'PUT',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/asset-rates',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create or update an asset rate (upsert)',
      input: {
        from: { type: 'string', required: true, description: 'Source asset code (e.g. USD)' },
        to: { type: 'string', required: true, description: 'Target asset code (e.g. BRL)' },
        rate: { type: 'number', required: true, description: 'Conversion rate value' },
        scale: { type: 'number', required: false, description: 'Decimal places for the rate' },
        source: { type: 'string', required: false, description: 'Rate source (e.g. "Central Bank")' },
        ttl: { type: 'number', required: false, description: 'Time-to-live in seconds' },
        externalId: { type: 'string', required: false, description: 'External identifier (UUID)' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: { from: 'USD', to: 'BRL', rate: 500, scale: 2, source: 'Central Bank', ttl: 3600 },
    },
    getByExternalId: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/asset-rates/external/:externalId',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        externalId: { type: 'string', required: true, description: 'External ID' },
      },
      description: 'Get asset rate by external ID',
    },
    getByAssetCode: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/asset-rates/:assetCode',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        assetCode: { type: 'string', required: true, description: 'Asset code to look up rates for' },
      },
      description: 'Get asset rate by asset code',
    },
  },
};
