export const PRODUCT_REGISTRY = {
  midaz: {
    id: 'midaz',
    name: 'Midaz',
    description: 'Financial ledger platform with onboarding, balances, transactions, and CRM.',
    docsPaths: ['/midaz'],
    repoPath: '../midaz',
    categories: ['transactions', 'ledgers', 'accounts', 'portfolios', 'organizations', 'balances', 'crm'],
    keywords: ['midaz', 'ledger', 'transactions', 'crm', 'balances', 'dsl'],
    sdkLanguages: ['go', 'typescript', 'javascript'],
    primaryWorkflows: [
      'Onboarding organizations, ledgers, assets, and accounts',
      'Executing and troubleshooting financial transactions',
      'Investigating balances, operations, and account state'
    ],
    currentMcpSupport: [
      'Portfolio discovery, docs, learning, and search via lerian',
      'Live schema discovery via midaz-discover',
      'Live generic API execution via midaz-execute'
    ],
    targetMcpSupport: [
      'Transaction DSL validation and generation',
      'Operational diagnostics and incident workflows',
      'Richer typed actions over ledger and CRM surfaces'
    ]
  },
  reporter: {
    id: 'reporter',
    name: 'Reporter',
    description: 'Template-driven report generation with async workers, storage, and datasource management.',
    docsPaths: ['/reporter'],
    repoPath: '../reporter',
    categories: ['reports', 'templates', 'analytics', 'dashboards', 'datasources'],
    keywords: ['reporter', 'templates', 'reports', 'datasource', 'pongo2', 'pdf'],
    sdkLanguages: [],
    primaryWorkflows: [
      'Managing datasource connections and schemas',
      'Authoring and validating templates',
      'Triggering and diagnosing report generation'
    ],
    currentMcpSupport: [
      'Portfolio discovery, docs, learning, and search via lerian',
      'Live schema discovery via reporter-discover',
      'Live generic API execution via reporter-execute',
      'Multipart template upload/update and binary report download via reporter-execute'
    ],
    targetMcpSupport: [
      'Deeper template assistant and validation workflows',
      'Richer report lifecycle control and result retrieval',
      'Queue, storage, and Fetcher integration diagnostics'
    ]
  },
  fetcher: {
    id: 'fetcher',
    name: 'Fetcher',
    description: 'Centralized datasource connection, schema discovery, and asynchronous extraction service.',
    docsPaths: ['/fetcher'],
    repoPath: '../fetcher',
    categories: ['connections', 'schemas', 'jobs', 'extraction', 'datasources'],
    keywords: ['fetcher', 'connections', 'schemas', 'jobs', 'extraction', 'datasource'],
    sdkLanguages: [],
    primaryWorkflows: [
      'Managing datasource connections and assignments',
      'Inspecting schemas and mapped fields',
      'Creating, tracking, and diagnosing extraction jobs'
    ],
    currentMcpSupport: [
      'Portfolio discovery, docs, learning, and search via lerian',
      'Live schema discovery via fetcher-discover',
      'Live generic API execution via fetcher-execute'
    ],
    targetMcpSupport: [
      'Connection and schema control plane',
      'Job payload builder and validator',
      'Tenant-aware internal datasource discovery'
    ]
  },
  matcher: {
    id: 'matcher',
    name: 'Matcher',
    description: 'Reconciliation engine for matching Midaz transactions against external systems.',
    docsPaths: ['/matcher'],
    repoPath: '../matcher',
    categories: ['matching', 'reconciliation', 'exceptions', 'governance', 'audit'],
    keywords: ['matcher', 'reconciliation', 'exceptions', 'disputes', 'audit', 'systemplane'],
    sdkLanguages: [],
    primaryWorkflows: [
      'Configuring reconciliation contexts and sources',
      'Running matching and resolving exceptions',
      'Investigating governance and audit trails'
    ],
    currentMcpSupport: [
      'Portfolio discovery, docs, learning, and search via lerian',
      'Live schema discovery via matcher-discover',
      'Live generic API execution via matcher-execute',
      'Cross-product workflow support via portfolio-workflow for matcher-to-fetcher-to-midaz',
      'Governance and reporting surfaces via matcher-discover and matcher-execute'
    ],
    targetMcpSupport: [
      'Reconciliation control-plane actions',
      'Exception and dispute investigation',
      'Runtime and systemplane diagnostics',
      'Deeper reporting/export and governance automation'
    ]
  },
  tracer: {
    id: 'tracer',
    name: 'Tracer',
    description: 'Transaction validation engine with rules, limits, and compliance-grade auditability.',
    docsPaths: ['/tracer'],
    repoPath: '../tracer',
    categories: ['tracing', 'rules', 'limits', 'compliance', 'audit'],
    keywords: ['tracer', 'validation', 'rules', 'limits', 'compliance', 'audit'],
    sdkLanguages: [],
    primaryWorkflows: [
      'Managing rules and limits',
      'Simulating and explaining validation decisions',
      'Investigating audit and compliance history'
    ],
    currentMcpSupport: [
      'Portfolio discovery, docs, learning, and search via lerian',
      'Live schema discovery via tracer-discover',
      'Live generic API execution via tracer-execute'
    ],
    targetMcpSupport: [
      'Validation simulation and explanation',
      'Rules and limits control plane',
      'Compliance investigation and runtime diagnostics'
    ]
  },
  underwriter: {
    id: 'underwriter',
    name: 'Underwriter',
    description: 'Jurisdiction-aware lending service for loan products and schedule preview.',
    docsPaths: ['/underwriter'],
    repoPath: '../underwriter',
    categories: ['loan-products', 'jurisdictions', 'schedules', 'origination', 'servicing'],
    keywords: ['underwriter', 'loan', 'jurisdiction', 'schedule', 'origination', 'servicing'],
    sdkLanguages: [],
    primaryWorkflows: [
      'Managing loan products and versions',
      'Exploring jurisdiction profiles',
      'Simulating repayment schedules'
    ],
    currentMcpSupport: [
      'Portfolio discovery, docs, learning, and search via lerian',
      'Live schema discovery via underwriter-discover',
      'Live generic API execution via underwriter-execute',
      'Jurisdiction, loan-product, schedule-preview, and example surfaces via underwriter-discover and underwriter-execute'
    ],
    targetMcpSupport: [
      'Jurisdiction explorer and validator',
      'Loan-product control-plane operations',
      'Schedule preview simulation and diagnostics',
      'Broader origination and servicing surfaces as they are mounted in the runtime'
    ]
  },
  flowker: {
    id: 'flowker',
    name: 'Flowker',
    description: 'Workflow orchestration platform for validation, providers, webhooks, and execution flows.',
    docsPaths: ['/flowker'],
    repoPath: '../flowker',
    categories: ['workflows', 'providers', 'executors', 'webhooks', 'audit'],
    keywords: ['flowker', 'workflow', 'providers', 'executors', 'webhooks', 'audit'],
    sdkLanguages: [],
    primaryWorkflows: [
      'Managing workflow lifecycle and templates',
      'Configuring providers and executors',
      'Triggering, debugging, and auditing executions'
    ],
    currentMcpSupport: [
      'Portfolio discovery, docs, learning, and search via lerian',
      'Live schema discovery via flowker-discover',
      'Live generic API execution via flowker-execute',
      'Workflow, execution, provider, executor, observability, and webhook surfaces via flowker-discover and flowker-execute'
    ],
    targetMcpSupport: [
      'Catalog-aware workflow authoring',
      'Execution debugging and webhook inspection',
      'Cross-product orchestration guidance',
      'Higher-level typed workflow-builder assistance'
    ]
  }
};

export const PRODUCT_IDS = [...Object.keys(PRODUCT_REGISTRY), 'all'];

function cloneArray(values = []) {
  return values.map((value) => value);
}

export function getProductConfig(product) {
  return PRODUCT_REGISTRY[product] || null;
}

export function listProducts() {
  return Object.values(PRODUCT_REGISTRY).map((product) => ({
    ...product,
    docsPaths: cloneArray(product.docsPaths),
    categories: cloneArray(product.categories),
    keywords: cloneArray(product.keywords),
    sdkLanguages: cloneArray(product.sdkLanguages),
    primaryWorkflows: cloneArray(product.primaryWorkflows),
    currentMcpSupport: cloneArray(product.currentMcpSupport),
    targetMcpSupport: cloneArray(product.targetMcpSupport)
  }));
}

export function isResourceForProduct(resource, productConfig) {
  if (!productConfig) {
    return false;
  }

  const pathHaystack = [resource?.path, resource?.url, resource?.source]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const textHaystack = [resource?.title, resource?.description, resource?.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const productId = productConfig.id.toLowerCase();
  const productName = productConfig.name.toLowerCase();

  if (productConfig.docsPaths.some((docsPath) => pathHaystack.includes(docsPath.toLowerCase()))) {
    return true;
  }

  if (pathHaystack.includes(`/${productId}/`) || pathHaystack.includes(`/products/${productId}`)) {
    return true;
  }

  if (textHaystack.includes(productId) || textHaystack.includes(productName)) {
    return true;
  }

  // Generic categories and keywords are ranking signals, not product ownership.
  return false;
}
