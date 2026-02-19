export const holdersSchema = {
  resource: 'holders',
  component: 'crm',
  description: 'Customer/entity management - natural persons or legal persons with addresses, contacts, and documents',
  actions: {
    create: {
      method: 'POST',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'Create a new holder (customer/entity)',
      input: {
        name: { type: 'string', required: true, description: 'Full name (max 256 chars)' },
        type: { type: 'string', required: true, description: 'NATURAL_PERSON or LEGAL_PERSON' },
        document: { type: 'string', required: true, description: 'Primary identification document (max 256 chars)' },
        externalId: { type: 'string', required: false, description: 'External system identifier' },
        addresses: {
          type: 'object', required: false, description: 'Addresses (primary, additional1, additional2)',
          properties: {
            primary: { type: 'object', description: '{ line1, line2, zipCode, city, state, country }' },
            additional1: { type: 'object', description: 'Second address (same structure)' },
            additional2: { type: 'object', description: 'Third address (same structure)' },
          },
        },
        contact: {
          type: 'object', required: false, description: 'Contact information',
          properties: {
            primaryEmail: { type: 'string', description: 'Primary email' },
            secondaryEmail: { type: 'string', description: 'Secondary email' },
            mobilePhone: { type: 'string', description: 'Mobile phone number' },
            otherPhone: { type: 'string', description: 'Other phone number' },
          },
        },
        naturalPerson: {
          type: 'object', required: false, description: 'Natural person details (only for NATURAL_PERSON type)',
          properties: {
            favoriteName: { type: 'string', description: 'Preferred name' },
            socialName: { type: 'string', description: 'Social/chosen name' },
            gender: { type: 'string', description: 'Gender' },
            birthDate: { type: 'string', description: 'Birth date (YYYY-MM-DD)' },
            civilStatus: { type: 'string', description: 'Marital status' },
            nationality: { type: 'string', description: 'Nationality' },
            motherName: { type: 'string', description: "Mother's name" },
            fatherName: { type: 'string', description: "Father's name" },
            status: { type: 'string', description: 'Person status' },
          },
        },
        legalPerson: {
          type: 'object', required: false, description: 'Legal person details (only for LEGAL_PERSON type)',
          properties: {
            tradeName: { type: 'string', description: 'Trading name' },
            activity: { type: 'string', description: 'Business activity' },
            type: { type: 'string', description: 'Company type' },
            foundingDate: { type: 'string', description: 'Founding date (YYYY-MM-DD)' },
            size: { type: 'string', description: 'Company size' },
            status: { type: 'string', description: 'Company status' },
            representative: {
              type: 'object', description: 'Legal representative',
              properties: {
                name: { type: 'string' },
                document: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
        metadata: { type: 'object', required: false, description: 'Custom key-value pairs' },
      },
      example: {
        name: 'John Doe',
        type: 'NATURAL_PERSON',
        document: '123.456.789-00',
        contact: { primaryEmail: 'john@example.com', mobilePhone: '+5511999999999' },
        naturalPerson: { birthDate: '1990-01-15', nationality: 'BR' },
      },
    },
    get: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Holder UUID' },
      },
      description: 'Get holder by ID',
    },
    list: {
      method: 'GET',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
      },
      description: 'List holders in a ledger',
      queryParams: {
        limit: { type: 'number', description: 'Items per page' },
        page: { type: 'number', description: 'Page number' },
      },
    },
    update: {
      method: 'PATCH',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Holder UUID' },
      },
      description: 'Update a holder',
      input: {
        name: { type: 'string', required: false, description: 'Updated name' },
        addresses: { type: 'object', required: false, description: 'Updated addresses' },
        contact: { type: 'object', required: false, description: 'Updated contact' },
        naturalPerson: { type: 'object', required: false, description: 'Updated natural person details' },
        legalPerson: { type: 'object', required: false, description: 'Updated legal person details' },
        metadata: { type: 'object', required: false, description: 'Updated metadata' },
      },
    },
    delete: {
      method: 'DELETE',
      path: '/v1/organizations/:organizationId/ledgers/:ledgerId/holders/:id',
      pathParams: {
        organizationId: { type: 'string', required: true, description: 'Organization UUID' },
        ledgerId: { type: 'string', required: true, description: 'Ledger UUID' },
        id: { type: 'string', required: true, description: 'Holder UUID' },
      },
      description: 'Delete a holder',
    },
  },
};
