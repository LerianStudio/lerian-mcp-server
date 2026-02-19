export const aliasesSchema = {
  resource: 'aliases',
  component: 'crm',
  description: 'Banking aliases for holders with banking details, regulatory fields, and related parties',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders/:holderId/aliases',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        holderId: { type: 'string', required: true, description: 'Holder UUID' },
      },
      description: 'Create an alias for a holder',
      input: {
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID for the alias' },
        accountId: { type: 'string', required: true, description: 'Account UUID to associate' },
        bankingDetails: {
          type: 'object', required: false, description: 'Banking information',
          properties: {
            branch: { type: 'string', description: 'Bank branch code' },
            account: { type: 'string', description: 'Bank account number' },
            type: { type: 'string', description: 'Account type (e.g. checking, savings)' },
            openingDate: { type: 'string', description: 'Account opening date (YYYY-MM-DD)' },
            closingDate: { type: 'string', description: 'Account closing date (YYYY-MM-DD)' },
            iban: { type: 'string', description: 'International Bank Account Number' },
            countryCode: { type: 'string', description: 'Country code (ISO 3166-1 alpha-2)' },
            bankId: { type: 'string', description: 'Bank identifier code' },
          },
        },
        regulatoryFields: {
          type: 'object', required: false, description: 'Regulatory compliance fields',
          properties: {
            participantDocument: { type: 'string', description: 'Participant document number' },
          },
        },
        relatedParties: {
          type: 'array', required: false, description: 'List of related parties',
          items: {
            id: { type: 'string', description: 'Party identifier' },
            document: { type: 'string', description: 'Party document' },
            name: { type: 'string', description: 'Party name' },
            role: { type: 'string', description: 'Relationship role' },
            startDate: { type: 'string', description: 'Relationship start date' },
            endDate: { type: 'string', description: 'Relationship end date' },
          },
        },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: {
        ledgerId: '<ledger-uuid>',
        accountId: '<account-uuid>',
        bankingDetails: { branch: '0001', account: '12345-6', type: 'checking', countryCode: 'BR' },
      },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders/:holderId/aliases/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        holderId: { type: 'string', required: true, description: 'Holder UUID' },
        id: { type: 'string', required: true, description: 'Alias UUID' },
      },
      description: 'Get alias by ID',
    },
    listByHolder: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders/:holderId/aliases',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        holderId: { type: 'string', required: true, description: 'Holder UUID' },
      },
      description: 'List aliases for a specific holder',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
      },
    },
    listAll: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/aliases',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List all aliases in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders/:holderId/aliases/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        holderId: { type: 'string', required: true, description: 'Holder UUID' },
        id: { type: 'string', required: true, description: 'Alias UUID' },
      },
      description: 'Update an alias',
      input: {
        bankingDetails: { type: 'object', required: false, description: 'Updated banking details' },
        regulatoryFields: { type: 'object', required: false, description: 'Updated regulatory fields' },
        relatedParties: { type: 'array', required: false, description: 'Updated related parties' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders/:holderId/aliases/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        holderId: { type: 'string', required: true, description: 'Holder UUID' },
        id: { type: 'string', required: true, description: 'Alias UUID' },
      },
      description: 'Delete an alias',
    },
    deleteRelatedParty: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders/:holderId/aliases/:id/related-parties/:partyId',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        holderId: { type: 'string', required: true, description: 'Holder UUID' },
        id: { type: 'string', required: true, description: 'Alias UUID' },
        partyId: { type: 'string', required: true, description: 'Related party ID' },
      },
      description: 'Delete a specific related party from an alias',
    },
  },
};
