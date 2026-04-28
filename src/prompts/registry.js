export const PROMPT_METADATA = [
  {
    name: 'help-me-start',
    description: 'Show me what I can do with this Lerian MCP server and how to get started quickly',
    arguments: []
  },
  {
    name: 'help-with-api',
    description: 'Show me how to use the live product API tools in this MCP server',
    arguments: []
  },
  {
    name: 'help-me-learn',
    description: 'Get personalized Lerian learning guidance based on your role and experience',
    arguments: [
      { name: 'role', description: 'Your primary role (developer, admin, business, explorer)', required: false },
      { name: 'experience', description: 'Your experience level (beginner, intermediate, advanced)', required: false }
    ]
  },
  {
    name: 'create-transaction-wizard',
    description: 'Guide me through creating a transaction step by step with my actual Midaz data',
    arguments: [
      { name: 'organization_id', description: 'Organization ID (will help find your ledgers)', required: false },
      { name: 'ledger_id', description: 'Ledger ID (will help find your accounts)', required: false },
      { name: 'transaction_type', description: 'Type of transaction', required: false },
      { name: 'step', description: 'Current step in the wizard (1-5)', required: false }
    ]
  },
  {
    name: 'debug-my-balance',
    description: 'Help me understand and troubleshoot balance issues with my accounts',
    arguments: [
      { name: 'organization_id', description: 'Organization ID to check', required: true },
      { name: 'ledger_id', description: 'Ledger ID to check', required: true },
      { name: 'account_id', description: 'Specific account ID to debug', required: false },
      { name: 'issue_type', description: 'Type of balance issue', required: false }
    ]
  },
  {
    name: 'setup-my-org',
    description: 'Guide me through setting up a new organization with ledgers, accounts, and initial configuration',
    arguments: [
      { name: 'org_name', description: 'Name for the new organization', required: false },
      { name: 'business_type', description: 'Type of business', required: false },
      { name: 'setup_stage', description: 'Current setup stage', required: false }
    ]
  },
  {
    name: 'explain-my-data',
    description: 'Help me understand my current Midaz data, balances, and transaction patterns',
    arguments: [
      { name: 'organization_id', description: 'Organization ID to analyze', required: true },
      { name: 'ledger_id', description: 'Specific ledger to focus on', required: false },
      { name: 'analysis_type', description: 'Type of analysis to perform', required: false },
      { name: 'time_period', description: 'Time period for analysis', required: false }
    ]
  },
  {
    name: 'check-file-balances',
    description: 'Analyze CSV, TXT, or JSON files to find account UUIDs and check their balances in Midaz',
    arguments: [
      { name: 'file_content', description: 'File content (CSV, TXT, or JSON format)', required: true },
      { name: 'file_type', description: 'File type (auto-detect if not specified)', required: false },
      { name: 'organization_hint', description: 'Hint for which organization to use', required: false },
      { name: 'ledger_hint', description: 'Hint for which ledger to use', required: false },
      { name: 'account_column', description: 'CSV column name containing account IDs (default: auto-detect)', required: false },
      { name: 'json_path', description: 'JSON path to account IDs', required: false },
      { name: 'confirm_uuids', description: 'For TXT files: confirm found UUIDs before proceeding', required: false }
    ]
  },
  {
    name: 'check-external-balance',
    description: 'Check the balance of external accounts for specific assets in Midaz ledgers',
    arguments: [
      { name: 'organization_id', description: 'Organization ID to check external balances', required: true },
      { name: 'ledger_id', description: 'Ledger ID to check external balances', required: true },
      { name: 'asset_code', description: 'Specific asset code to check (e.g. USD, EUR, BTC)', required: false },
      { name: 'list_all_assets', description: 'List all available assets first before checking balances', required: false }
    ]
  },
  {
    name: 'discover-midaz-hierarchy',
    description: 'Explore the complete Midaz hierarchy: organizations -> ledgers -> assets -> accounts -> portfolios',
    arguments: [
      { name: 'discovery_level', description: 'How deep to explore the hierarchy', required: true },
      { name: 'organization_id', description: 'Focus on specific organization', required: false },
      { name: 'ledger_id', description: 'Focus on specific ledger', required: false },
      { name: 'show_counts', description: 'Include count statistics', required: false },
      { name: 'include_metadata', description: 'Include metadata in results', required: false }
    ]
  },
  {
    name: 'show-all-tools',
    description: 'Display the current Lerian MCP tool catalog, prompt surface, and recommended entry points',
    arguments: [
      { name: 'category_filter', description: 'Filter tools by category', required: false },
      { name: 'detail_level', description: 'Level of detail to show', required: false },
    ]
  }
];

export function listPromptMetadata() {
  return PROMPT_METADATA.map((prompt) => ({
    ...prompt,
    arguments: prompt.arguments.map((argument) => ({ ...argument }))
  }));
}
