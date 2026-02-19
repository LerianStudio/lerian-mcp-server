export const transactionsSchema = {
  resource: 'transactions',
  component: 'transaction',
  description: 'Financial transactions with double-entry accounting (source/destination operations)',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create a transaction using JSON (full source+destination specification)',
      input: {
        send: {
          type: 'object', required: true, description: 'Send operation with asset, value, source and distribute',
          properties: {
            asset: { type: 'string', required: true, description: 'Asset code (e.g. USD)' },
            value: { type: 'string', required: true, description: 'Transaction amount (e.g. "100.00")' },
            source: {
              type: 'object', required: true, description: 'Source accounts',
              properties: {
                from: {
                  type: 'array', description: 'List of source operations',
                  items: {
                    account: { type: 'string', description: 'Account alias or @external/{asset}' },
                    amount: { type: 'object', description: '{ asset, value }' },
                    description: { type: 'string', description: 'Operation description' },
                    chartOfAccounts: { type: 'string', description: 'Chart of accounts code' },
                    metadata: { type: 'object', description: 'Operation metadata' },
                  },
                },
              },
            },
            distribute: {
              type: 'object', required: true, description: 'Destination accounts',
              properties: {
                to: {
                  type: 'array', description: 'List of destination operations',
                  items: {
                    account: { type: 'string', description: 'Account alias' },
                    amount: { type: 'object', description: '{ asset, value }' },
                    description: { type: 'string', description: 'Operation description' },
                    chartOfAccounts: { type: 'string', description: 'Chart of accounts code' },
                    metadata: { type: 'object', description: 'Operation metadata' },
                  },
                },
              },
            },
          },
        },
        chartOfAccountsGroupName: { type: 'string', required: false, description: 'Accounting group name' },
        description: { type: 'string', required: false, description: 'Transaction description (max 256)' },
        code: { type: 'string', required: false, description: 'Reference code (max 100)' },
        pending: { type: 'boolean', required: false, description: 'Create in pending state (default false)' },
        route: { type: 'string', required: false, description: 'Transaction route UUID' },
        transactionDate: { type: 'string', required: false, description: 'Transaction date (ISO 8601)' },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: {
        description: 'Fund transfer',
        send: {
          asset: 'USD',
          value: '100.00',
          source: { from: [{ account: '@source_account', amount: { asset: 'USD', value: '100.00' } }] },
          distribute: { to: [{ account: '@dest_account', amount: { asset: 'USD', value: '100.00' } }] },
        },
      },
    },
    createDSL: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions/dsl',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create a transaction using DSL template with variable substitution',
      input: {
        transactionType: { type: 'string', required: true, description: 'Transaction type UUID' },
        transactionTypeCode: { type: 'string', required: false, description: 'Transaction type code (e.g. PAYMENT)' },
        variables: { type: 'object', required: false, description: 'Variables to substitute in the template' },
      },
    },
    createInflow: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions/inflow',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create an inflow transaction (funds coming in from external, only specify destination)',
      input: {
        send: {
          type: 'object', required: true, description: 'Send with asset, value, and distribute only (source auto-generated as @external/{asset})',
          properties: {
            asset: { type: 'string', required: true, description: 'Asset code' },
            value: { type: 'string', required: true, description: 'Amount' },
            distribute: { type: 'object', required: true, description: 'Destination accounts { to: [...] }' },
          },
        },
        chartOfAccountsGroupName: { type: 'string', required: false, description: 'Accounting group' },
        description: { type: 'string', required: false, description: 'Description' },
        code: { type: 'string', required: false, description: 'Reference code' },
        route: { type: 'string', required: false, description: 'Route UUID' },
        transactionDate: { type: 'string', required: false, description: 'Transaction date' },
        metadata: { type: 'object', required: false, description: 'Metadata' },
      },
      example: {
        description: 'Deposit',
        send: {
          asset: 'USD',
          value: '500.00',
          distribute: { to: [{ account: '@savings', amount: { asset: 'USD', value: '500.00' } }] },
        },
      },
    },
    createOutflow: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions/outflow',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create an outflow transaction (funds going out to external, only specify source)',
      input: {
        send: {
          type: 'object', required: true, description: 'Send with asset, value, and source only (destination auto-generated as @external/{asset})',
          properties: {
            asset: { type: 'string', required: true, description: 'Asset code' },
            value: { type: 'string', required: true, description: 'Amount' },
            source: { type: 'object', required: true, description: 'Source accounts { from: [...] }' },
          },
        },
        chartOfAccountsGroupName: { type: 'string', required: false, description: 'Accounting group' },
        description: { type: 'string', required: false, description: 'Description' },
        code: { type: 'string', required: false, description: 'Reference code' },
        pending: { type: 'boolean', required: false, description: 'Create in pending state' },
        route: { type: 'string', required: false, description: 'Route UUID' },
        transactionDate: { type: 'string', required: false, description: 'Transaction date' },
        metadata: { type: 'object', required: false, description: 'Metadata' },
      },
    },
    createAnnotation: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions/annotation',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create an annotation transaction (bookkeeping entry that does NOT affect balances)',
      input: {
        send: { type: 'object', required: true, description: 'Same structure as regular transaction' },
        chartOfAccountsGroupName: { type: 'string', required: false, description: 'Accounting group' },
        description: { type: 'string', required: false, description: 'Description' },
        code: { type: 'string', required: false, description: 'Reference code' },
        metadata: { type: 'object', required: false, description: 'Metadata' },
      },
    },
    commit: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions/:id/commit',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Transaction UUID' },
      },
      description: 'Commit a pending transaction (applies balance changes)',
    },
    cancel: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions/:id/cancel',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Transaction UUID' },
      },
      description: 'Cancel a pending transaction (releases held balances)',
    },
    revert: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions/:id/revert',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Transaction UUID' },
      },
      description: 'Revert a committed transaction (creates a reversal transaction)',
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Transaction UUID' },
      },
      description: 'Get transaction by ID (includes operations)',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List transactions in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
        metadata: { type: 'object', description: 'Filter by metadata' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/transactions/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Transaction UUID' },
      },
      description: 'Update a transaction (description and metadata only)',
      input: {
        description: { type: 'string', required: false, description: 'Updated description' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
  },
};
