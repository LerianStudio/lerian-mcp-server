import { underwriterProtectedHeaders } from './shared.js';

export const loanApplicationsSchema = {
  resource: 'loan-applications',
  component: 'origination',
  description: 'Loan application simulation endpoints, currently focused on repayment schedule preview.',
  actions: {
    previewSchedule: {
      method: 'POST',
      path: '/api/v1/loan-applications/preview-schedule',
      description: 'Compute a deterministic declining-balance repayment schedule without persisting a loan application. Underwriter expects decimal amounts as strings and returns the effective payload wrapped in a data envelope.',
      requestHeaders: underwriterProtectedHeaders,
      input: {
        principalAmount: { type: 'string', required: true, description: 'Principal amount as a decimal string.' },
        annualInterestRate: { type: 'string', required: true, description: 'Annual interest rate as a decimal string.' },
        jurisdictionCode: { type: 'string', required: true, description: 'Jurisdiction profile code.' },
        dayCountConvention: { type: 'string', required: true, description: 'Day count convention for accrual and installment generation.' },
        startDate: { type: 'string', required: true, description: 'Schedule start date/time string.' },
        termMonths: { type: 'number', required: true, description: 'Loan term in months. Minimum 1, maximum 600.' },
        gracePeriodDays: { type: 'number', required: false, description: 'Optional grace period in days. Minimum 0, maximum 365.' }
      }
    }
  }
};
