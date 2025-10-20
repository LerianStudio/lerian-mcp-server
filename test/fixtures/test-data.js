/**
 * Test data fixtures for unit tests
 */

export const testOrganization = {
  id: '12345678-1234-1234-1234-123456789012',
  name: 'Test Organization',
  code: 'test-org',
  description: 'Test organization for unit tests',
  metadata: {
    test: true
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const testLedger = {
  id: '87654321-4321-4321-4321-210987654321',
  organizationId: testOrganization.id,
  name: 'Test Ledger',
  description: 'Test ledger for unit tests',
  metadata: {
    test: true
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const testAccount = {
  id: 'abcdef12-3456-7890-abcd-ef1234567890',
  organizationId: testOrganization.id,
  ledgerId: testLedger.id,
  name: 'Test Account',
  type: 'asset',
  code: 'test-account',
  metadata: {
    test: true
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const testTransaction = {
  id: 'fedcba09-8765-4321-fedc-ba0987654321',
  organizationId: testOrganization.id,
  ledgerId: testLedger.id,
  description: 'Test transaction',
  operations: [
    {
      accountId: testAccount.id,
      assetCode: 'USD',
      amount: -100.00,
      description: 'Debit'
    },
    {
      accountId: 'another-account-id',
      assetCode: 'USD',
      amount: 100.00,
      description: 'Credit'
    }
  ],
  status: 'completed',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const testBalance = {
  accountId: testAccount.id,
  assetCode: 'USD',
  available: 1000.00,
  onHold: 0.00,
  scale: 2,
  updatedAt: '2024-01-01T00:00:00Z'
};

export const testAsset = {
  id: 'asset-123-456-789',
  organizationId: testOrganization.id,
  ledgerId: testLedger.id,
  code: 'USD',
  name: 'US Dollar',
  type: 'currency',
  metadata: {
    symbol: '$',
    decimals: 2
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const testPortfolio = {
  id: 'portfolio-123-456',
  organizationId: testOrganization.id,
  ledgerId: testLedger.id,
  name: 'Test Portfolio',
  description: 'Test portfolio for unit tests',
  metadata: {
    test: true
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const testConfig = {
  backend: {
    onboarding: {
      baseUrl: 'http://localhost:3000',
      apiKey: 'test-api-key'
    },
    transaction: {
      baseUrl: 'http://localhost:3001',
      apiKey: 'test-api-key'
    },
    timeout: 10000,
    retries: 3
  },
  server: {
    name: 'test-server',
    version: '1.0.0',
    description: 'Test server'
  },
  useStubs: false,
  logLevel: 'info',
  autoDetect: false,
  localOnly: true,
  docsUrl: 'https://docs.test.com'
};

export const maliciousInputs = {
  sqlInjection: "'; DROP TABLE users; --",
  xss: '<script>alert("XSS")</script>',
  pathTraversal: '../../../etc/passwd',
  commandInjection: '; rm -rf /',
  ldapInjection: '*)(uid=*',
  xmlInjection: '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
  longString: 'A'.repeat(10000),
  specialChars: '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
};
