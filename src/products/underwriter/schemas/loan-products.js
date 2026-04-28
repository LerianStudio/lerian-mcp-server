import { underwriterProtectedHeaders } from './shared.js';

const loanProductPathParam = {
  id: { type: 'string', required: true, description: 'Loan product UUID.' }
};

export const loanProductsSchema = {
  resource: 'loan-products',
  component: 'products',
  description: 'Loan product catalog lifecycle including creation, activation, versioning, and current stubs for supplementary product assets.',
  actions: {
    list: {
      method: 'GET',
      path: '/api/v1/loan-products',
      description: 'List loan products with limit/offset pagination.',
      requestHeaders: underwriterProtectedHeaders,
      queryParams: {
        limit: { type: 'number', description: 'Page size. Default 20, maximum 100.' },
        offset: { type: 'number', description: 'Offset for pagination. Negative values are coerced to 0.' }
      }
    },
    create: {
      method: 'POST',
      path: '/api/v1/loan-products',
      description: 'Create a new loan product definition.',
      requestHeaders: underwriterProtectedHeaders,
      input: {
        name: { type: 'string', required: false, description: 'Loan product name.' },
        loanType: { type: 'string', required: false, description: 'Loan type identifier.' },
        jurisdictionCode: { type: 'string', required: true, description: 'Jurisdiction profile code.' },
        taxRegime: { type: 'string', required: false, description: 'Tax regime identifier.' },
        capitalizationClauseRequired: { type: 'boolean', required: false, description: 'Whether capitalization clause is required.' },
        hasMonthlyCompoundingRule: { type: 'boolean', required: false, description: 'Whether monthly compounding rule applies.' },
        cardProductEnabled: { type: 'boolean', required: false, description: 'Whether card-product features are enabled.' },
        cdcCapEnabled: { type: 'boolean', required: false, description: 'Whether CDC cap logic is enabled.' },
        cdcCap: { type: 'number', required: false, description: 'CDC cap numeric value.' },
        regulatoryMax: { type: 'number', required: false, description: 'Regulatory maximum numeric value.' }
      }
    },
    get: {
      method: 'GET',
      path: '/api/v1/loan-products/:id',
      description: 'Get one loan product by ID.',
      requestHeaders: underwriterProtectedHeaders,
      pathParams: loanProductPathParam
    },
    activate: {
      method: 'POST',
      path: '/api/v1/loan-products/:id/activate',
      description: 'Activate a loan product.',
      requestHeaders: underwriterProtectedHeaders,
      pathParams: loanProductPathParam
    },
    createVersion: {
      method: 'POST',
      path: '/api/v1/loan-products/:id/versions',
      description: 'Create a new version snapshot for a loan product with updated regulatory parameters.',
      requestHeaders: underwriterProtectedHeaders,
      pathParams: loanProductPathParam,
      input: {
        jurisdictionCode: { type: 'string', required: false, description: 'Jurisdiction profile code.' },
        taxRegime: { type: 'string', required: false, description: 'Updated tax regime identifier.' },
        changeReason: { type: 'string', required: false, description: 'Reason for creating the new version.' },
        capitalizationClauseRequired: { type: 'boolean', required: false, description: 'Updated capitalization-clause requirement.' },
        hasMonthlyCompoundingRule: { type: 'boolean', required: false, description: 'Updated monthly compounding rule flag.' },
        cardProductEnabled: { type: 'boolean', required: false, description: 'Updated card-product flag.' },
        cdcCapEnabled: { type: 'boolean', required: false, description: 'Updated CDC cap flag.' },
        cdcCap: { type: 'number', required: false, description: 'Updated CDC cap numeric value.' },
        regulatoryMax: { type: 'number', required: false, description: 'Updated regulatory maximum numeric value.' }
      }
    },
    createAccountingProfile: {
      method: 'POST',
      path: '/api/v1/loan-products/:id/accounting-profiles',
      description: 'Stub endpoint that currently returns 202 Accepted for loan product accounting profiles.',
      requestHeaders: underwriterProtectedHeaders,
      pathParams: loanProductPathParam
    },
    createCharges: {
      method: 'POST',
      path: '/api/v1/loan-products/:id/charges',
      description: 'Stub endpoint that currently returns 202 Accepted for loan product charges.',
      requestHeaders: underwriterProtectedHeaders,
      pathParams: loanProductPathParam
    },
    listFloatingRates: {
      method: 'GET',
      path: '/api/v1/loan-products/:id/floating-rates',
      description: 'Stub endpoint that currently returns an empty floating-rates list.',
      requestHeaders: underwriterProtectedHeaders,
      pathParams: loanProductPathParam
    }
  }
};
