/**
 * Advanced Midaz Workflow Prompts
 * Intelligent prompts that chain operations and handle complex data flows
 */

import { createLogger } from "../util/mcp-logging.js";
import { z } from 'zod';
import { getRuntimeSurface } from '../runtime/surface-registry.js';
import { registerMcpPrompt } from '../util/mcp-registration.js';

const logger = createLogger('advanced-prompts');

/**
 * Register advanced workflow prompts
 */
export const registerAdvancedPrompts = (server) => {

  // Multi-Format File Balance Checker - Intelligent account balance analysis from CSV/TXT/JSON
  registerMcpPrompt(
    server,
    "check-file-balances",
    "Analyze CSV, TXT, or JSON files to find account UUIDs and check their balances in Midaz",
    {
      file_content: z.string().describe("File content (CSV, TXT, or JSON format)"),
      file_type: z.enum(["csv", "txt", "json", "auto"]).optional().describe("File type (auto-detect if not specified)"),
      organization_hint: z.string().optional().describe("Hint for which organization to use (will auto-detect if not provided)"),
      ledger_hint: z.string().optional().describe("Hint for which ledger to use (will auto-detect if not provided)"),
      account_column: z.string().optional().describe("CSV column name containing account IDs (default: auto-detect)"),
      json_path: z.string().optional().describe("JSON path to account IDs (e.g., 'accounts[].id' or 'data.account_ids')"),
      confirm_uuids: z.boolean().optional().describe("For TXT files: confirm found UUIDs before proceeding")
    },
    async (args) => {
      const { file_content, file_type = "auto", organization_hint, ledger_hint, account_column, json_path, confirm_uuids = false } = args;
      
      // Auto-detect file type
      let detectedType = file_type;
      if (file_type === "auto") {
        if (file_content.trim().startsWith('{') || file_content.trim().startsWith('[')) {
          detectedType = "json";
        } else if (file_content.includes(',') && (file_content.includes('\n') || file_content.includes('\r'))) {
          detectedType = "csv";
        } else {
          detectedType = "txt";
        }
      }
      
      const content = `# 📊 Multi-Format File Balance Checker

## File Analysis & Balance Checking Process

**File Type:** ${detectedType.toUpperCase()} ${file_type === "auto" ? "(auto-detected)" : "(specified)"}
**File Size:** ${file_content.length > 100 ? `${(file_content.length/1024).toFixed(1)}KB` : `${file_content.length} chars`}

### 🔍 Phase 1: File Analysis & UUID Extraction

${detectedType === "csv" ? `
**CSV File Processing:**
1. **Parse CSV Structure**
   - Identify columns and headers
   - Look for UUID patterns in: ${account_column || 'auto-detecting columns'}
   - Extract unique account identifiers

2. **UUID Validation**
   - Validate UUID format (36 characters, dashes in correct positions)
   - Filter out invalid entries
   - Report parsing statistics` : 

detectedType === "json" ? `
**JSON File Processing:**
1. **Parse JSON Structure**
   - Navigate to account data using path: ${json_path || 'auto-detecting paths'}
   - Look for UUID patterns in arrays and objects
   - Handle nested structures intelligently

2. **UUID Extraction**
   - Extract UUIDs from specified JSON paths
   - Support multiple formats: arrays, nested objects, mixed structures
   - Validate UUID format and uniqueness` :

`**TXT File Processing:**
1. **Pattern Recognition**
   - Scan entire text for UUID patterns
   - Use regex: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
   - Extract all potential UUIDs

${confirm_uuids ? `
2. **LLM Confirmation Required** ⚠️
   - **IMPORTANT:** For TXT files, you must confirm found UUIDs
   - I'll show you all extracted UUIDs for verification
   - Only confirmed UUIDs will be processed for balance checking
   - This prevents false positives from random UUID-like strings` : `
2. **Automatic Processing**
   - All valid UUID patterns will be processed
   - Set confirm_uuids=true for manual verification`}

3. **UUID Validation**
   - Validate format and checksum
   - Remove duplicates and invalid entries`}

### 🏢 Phase 2: Organization Discovery
${organization_hint ? 
  `**Using Organization Hint:** ${organization_hint}
   - First, I'll verify this organization exists
   - Use: \`midaz-discover\` to inspect organizations, then \`midaz-execute\` with resource="organizations", action="list" to confirm` :
  `**Auto-Discovery Mode:**
   - Use: \`midaz-discover\` to inspect organizations, then \`midaz-execute\` with resource="organizations", action="list" to see all available organizations
   - If multiple organizations found, I'll ask you to choose
   - If only one organization, I'll proceed automatically`}

### 📚 Phase 3: Ledger Discovery  
${ledger_hint ?
  `**Using Ledger Hint:** ${ledger_hint}
   - Verify ledger exists in chosen organization
   - Use: \`midaz-execute\` with resource="ledgers", action="list", and organization path context` :
  `**Auto-Discovery Mode:**
   - Use: \`midaz-execute\` with resource="ledgers" and action="list" for the chosen organization
   - If multiple ledgers found, I'll ask you to choose
   - If only one ledger, I'll proceed automatically`}

### 💰 Phase 4: Balance Checking
**For each account UUID from your CSV:**

1. **Account Verification**
   - Use: \`midaz-execute\` with resource="accounts" and action="list" to verify account exists
   - Match CSV UUIDs against actual account IDs
   - Report missing/invalid accounts

2. **Balance Retrieval**
   - Use: \`midaz-execute\` with the balance action contract for each valid account
   - Collect balance data with asset information
   - Handle any errors gracefully

3. **Results Compilation**
   - Create summary table: Account ID | Name | Balance | Asset | Status
   - Calculate totals by asset type
   - Identify accounts with zero or negative balances

## 📋 Expected Output Format

\`\`\`
CSV Balance Analysis Results
============================
Organization: [Name] (ID: xxx-xxx)
Ledger: [Name] (ID: xxx-xxx)
Analysis Date: ${new Date().toISOString()}

Account Summary:
┌─────────────────────────────────────┬──────────────────┬─────────────┬───────┬────────────┐
│ Account ID                          │ Account Name     │ Balance     │ Asset │ Status     │
├─────────────────────────────────────┼──────────────────┼─────────────┼───────┼────────────┤
│ 12345678-1234-1234-1234-123456789012│ Customer Wallet  │ 1,500.00   │ USD   │ ✅ Active   │
│ 12345678-1234-1234-1234-123456789013│ Merchant Account │ 25,000.00  │ USD   │ ✅ Active   │
│ 12345678-1234-1234-1234-123456789014│ Fee Collection   │ 125.50     │ USD   │ ✅ Active   │
└─────────────────────────────────────┴──────────────────┴─────────────┴───────┴────────────┘

Totals by Asset:
• USD: $26,625.50 (3 accounts)
• EUR: €0.00 (0 accounts)

Issues Found:
• 2 UUIDs from CSV not found in Midaz
• 0 accounts with negative balances
• 1 account with zero balance
\`\`\`

## 🚀 Ready to Start?

**Next Steps:**
1. **Provide your CSV data** (paste content or provide file path)
2. **I'll analyze and extract UUIDs**
3. **Choose organization/ledger** (or let me auto-detect)
4. **Get comprehensive balance report**

**Commands I'll Use:**
- \`midaz-discover\` → \`midaz-execute\` organizations.list → ledgers.list → accounts.list → balance lookup

This creates a complete audit trail from your CSV to live Midaz balances! 🎯`;

      return {
        description: `${detectedType.toUpperCase()} balance checker with intelligent discovery`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: content
          }
        }]
      };
    }
  );

  // External Balance Checker - Check external account balances by asset
  registerMcpPrompt(
    server,
    "check-external-balance",
    "Check the balance of external accounts for specific assets in Midaz ledgers",
    {
      organization_id: z.string().describe("Organization ID to check external balances"),
      ledger_id: z.string().describe("Ledger ID to check external balances"),
      asset_code: z.string().optional().describe("Specific asset code to check (e.g., USD, EUR, BTC)"),
      list_all_assets: z.boolean().optional().describe("List all available assets first before checking balances")
    },
    async (args) => {
      const { organization_id, ledger_id, asset_code, list_all_assets = false } = args;
      
      const content = `# 💰 External Balance Checker

## External Account Balance Analysis

**Organization:** ${organization_id}
**Ledger:** ${ledger_id}
${asset_code ? `**Target Asset:** ${asset_code}` : '**Assets:** All available assets'}

---

## 🔍 What are External Accounts?

External accounts in Midaz represent **system-level accounts** for each asset type within a ledger. They are special accounts that:

- **Track total external balances** for each asset (USD, EUR, BTC, etc.)
- **Represent funds outside** the internal account system
- **Handle external deposits/withdrawals** to/from the ledger
- **Maintain asset-level liquidity** information

**Key Characteristics:**
- One external account per asset per ledger
- Accessed via asset code (not UUID)
- Represent "external world" balances
- Critical for reconciliation and liquidity management

---

## 🚀 External Balance Checking Workflow

### Step 1: Asset Discovery ${list_all_assets ? '(Requested)' : '(Optional)'}
${list_all_assets || !asset_code ? `
**List Available Assets:**
Use \`midaz-execute\` with resource="assets" and action="list" using:
- organization_id: "${organization_id}"
- ledger_id: "${ledger_id}"

**Expected Results:**
- Asset codes (USD, EUR, BTC, POINTS, etc.)
- Asset names and descriptions
- Asset configurations and metadata
- Active/inactive status

This helps you understand which external accounts exist.` : `
**Skip Asset Discovery** - Using specified asset: ${asset_code}
${asset_code ? `Proceeding directly to balance check for ${asset_code}` : ''}`}

### Step 2: External Account Retrieval
${asset_code ? `
**Get External Account for ${asset_code}:**
Use: External account retrieval with:
- organization_id: "${organization_id}"
- ledger_id: "${ledger_id}"
- asset_code: "${asset_code}"

**API Endpoint Pattern:**
\`GET /v1/organizations/{org_id}/ledgers/{ledger_id}/accounts/external/{asset_code}\`

**Expected Response:**
- External account ID and details
- Account type (usually "external" or "system")
- Asset code confirmation
- Account status and configuration` : `
**Get External Accounts for All Assets:**
For each asset found in Step 1, retrieve the external account details.
This gives you the complete external account structure.`}

### Step 3: External Balance Checking
${asset_code ? `
**Check External Balance for ${asset_code}:**
Use: External balance retrieval with:
- organization_id: "${organization_id}"
- ledger_id: "${ledger_id}"
- asset_code: "${asset_code}"

**API Endpoint Pattern:**
\`GET /v1/organizations/{org_id}/ledgers/{ledger_id}/accounts/external/{asset_code}/balances\`

**Balance Information:**
- **Available Balance:** Funds available for transactions
- **On Hold Balance:** Funds temporarily reserved
- **Scale:** Decimal precision for the asset
- **Version:** Balance version for concurrency control
- **Permissions:** Allow sending/receiving flags` : `
**Check External Balances for All Assets:**
For each asset code, check the external balance to get:
- Complete liquidity picture across all assets
- External vs internal balance comparison
- Asset-level fund availability`}

---

## 📊 Expected Results Format

**Single Asset Balance:**
\`\`\`json
{
  "assetCode": "${asset_code || 'USD'}",
  "available": 1000000,
  "onHold": 50000,
  "scale": 2,
  "accountType": "external",
  "allowSending": true,
  "allowReceiving": true,
  "version": 42,
  "updatedAt": "2024-01-15T10:30:00Z"
}
\`\`\`

**Multi-Asset Summary:**
\`\`\`
External Balance Summary - ${new Date().toISOString()}
Organization: ${organization_id}
Ledger: ${ledger_id}

┌─────────────┬──────────────────┬─────────────────┬───────────┬────────────┐
│ Asset Code  │ Available        │ On Hold         │ Scale     │ Status     │
├─────────────┼──────────────────┼─────────────────┼───────────┼────────────┤
│ USD         │ 1,000,000.00     │ 50,000.00      │ 2         │ ✅ Active   │
│ EUR         │ 750,500.50       │ 25,000.00      │ 2         │ ✅ Active   │
│ BTC         │ 10.50000000      │ 0.00000000     │ 8         │ ✅ Active   │
└─────────────┴──────────────────┴─────────────────┴───────────┴────────────┘

Total External Liquidity:
• USD: $1,050,000.00 (Available + Hold)
• EUR: €775,500.50 (Available + Hold)  
• BTC: ₿10.50000000 (Available + Hold)
\`\`\`

## 💡 Business Intelligence

**What External Balances Tell You:**
- **Liquidity Position:** How much of each asset is available externally
- **Reserve Management:** Funds held for external obligations
- **Asset Distribution:** Which assets have external exposure
- **Operational Capacity:** Available funds for new external transactions

**Common Use Cases:**
- **Treasury Management:** Monitor external asset positions
- **Compliance Reporting:** External balance reconciliation
- **Liquidity Planning:** Understand available external funds
- **Risk Assessment:** External exposure by asset type

## 🎯 Next Steps

After checking external balances:
1. **Compare with Internal Balances:** Use \`midaz-execute\` account listing plus balance lookup for internal accounts
2. **Analyze Asset Distribution:** Understand internal vs external allocation
3. **Plan Transactions:** Use balance info for transaction planning
4. **Monitor Changes:** Set up regular external balance monitoring

**Commands I'll Execute:**
\`\`\`
${list_all_assets ? 'midaz-execute assets.list →' : ''} 
external-account-retrieval → external-balance-check
\`\`\`

Ready to check your external balances! 🚀`;

      return {
        description: `External balance check for ${asset_code || 'all assets'} in ledger`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: content
          }
        }]
      };
    }
  );

  // Chained Discovery - Intelligent hierarchy exploration
  registerMcpPrompt(
    server,
    "discover-midaz-hierarchy",
    "Explore the complete Midaz hierarchy: organizations → ledgers → assets → accounts → portfolios",
    {
      discovery_level: z.enum(["organizations", "ledgers", "assets", "accounts", "portfolios", "full"]).describe("How deep to explore the hierarchy"),
      organization_id: z.string().optional().describe("Focus on specific organization"),
      ledger_id: z.string().optional().describe("Focus on specific ledger"),
      show_counts: z.boolean().optional().describe("Include count statistics"),
      include_metadata: z.boolean().optional().describe("Include metadata in results")
    },
    async (args) => {
      const { discovery_level = "full", organization_id, ledger_id, show_counts = true, include_metadata = false } = args;
      
      let content = `# 🔍 Midaz Hierarchy Discovery

## ${discovery_level.toUpperCase()} Level Exploration

**Discovery Scope:** ${organization_id ? `Organization ${organization_id}` : 'All Organizations'}
${ledger_id ? `**Ledger Focus:** ${ledger_id}` : ''}
**Statistics:** ${show_counts ? 'Enabled' : 'Disabled'}
**Metadata:** ${include_metadata ? 'Included' : 'Excluded'}

---

`;

      // Phase 1: Organizations
      if (discovery_level === "organizations" || discovery_level === "full") {
        content += `### 🏢 Phase 1: Organizations Discovery

**Command:** \`midaz-execute\` with resource="organizations" and action="list"${show_counts ? ' (with statistics if supported by the contract)' : ''}

**Expected Information:**
- Organization IDs and names
- Organization status and metadata${include_metadata ? ' (full metadata)' : ''}
${show_counts ? '- Count of ledgers per organization' : ''}
- Creation dates and last modified

**Analysis Points:**
- Which organizations are active?
- How are organizations structured?
- What metadata patterns exist?

`;
      }

      // Phase 2: Ledgers
      if ((discovery_level === "ledgers" || discovery_level === "full") && discovery_level !== "organizations") {
        content += `### 📚 Phase 2: Ledgers Discovery

${organization_id ? 
  `**Command:** \`midaz-execute\` with resource="ledgers", action="list", pathParams={"organizationId":"${organization_id}"}` :
  `**Command:** \`midaz-execute\` with resource="ledgers" and action="list" for each organization found`}

**Expected Information:**
- Ledger IDs, names, and descriptions
- Ledger configurations and settings
${show_counts ? '- Count of accounts and assets per ledger' : ''}
${include_metadata ? '- Full ledger metadata and configuration' : ''}

**Analysis Points:**
- How many ledgers per organization?
- What's the ledger naming/organization strategy?
- Are there different ledger types or purposes?

`;
      }

      // Phase 3: Assets
      if ((discovery_level === "assets" || discovery_level === "full") && !["organizations", "ledgers"].includes(discovery_level)) {
        content += `### 💎 Phase 3: Assets Discovery

${ledger_id ?
  `**Command:** \`midaz-execute\` with resource="assets" and pathParams={"ledgerId":"${ledger_id}"}` :
  organization_id ?
    `**Command:** \`midaz-execute\` with resource="assets" for all ledgers in organization` :
    `**Command:** \`midaz-execute\` with resource="assets" for each ledger found`}

**Expected Information:**
- Asset codes and names (USD, EUR, BTC, etc.)
- Asset types and configurations
- Asset metadata and properties
${show_counts ? '- Usage statistics per asset' : ''}

**Analysis Points:**
- What currencies/tokens are supported?
- Are there custom assets or standard ones?
- How are assets distributed across ledgers?

`;
      }

      // Phase 4: Accounts
      if ((discovery_level === "accounts" || discovery_level === "full") && !["organizations", "ledgers", "assets"].includes(discovery_level)) {
        content += `### 💳 Phase 4: Accounts Discovery

**Command Pattern:** \`midaz-execute\` with resource="accounts" and organization + ledger context

**Expected Information:**
- Account IDs, names, and types
- Account balances and asset holdings
- Account metadata and categorization
${show_counts ? '- Transaction counts per account' : ''}
${include_metadata ? '- Full account metadata and settings' : ''}

**Analysis Points:**
- What's the account structure/hierarchy?
- How are balances distributed?
- What account types are being used?
- Which accounts are most active?

`;
      }

      // Phase 5: Portfolios
      if ((discovery_level === "portfolios" || discovery_level === "full") && discovery_level !== "organizations") {
        content += `### 📁 Phase 5: Portfolios Discovery

**Command Pattern:** \`midaz-execute\` with resource="portfolios" for organizational groupings

**Expected Information:**
- Portfolio IDs, names, and descriptions
- Portfolio account memberships
- Portfolio categorization and metadata
${show_counts ? '- Account counts and balance totals per portfolio' : ''}

**Analysis Points:**
- How are accounts organized into portfolios?
- What portfolio strategies are in use?
- Are portfolios used for business logic or just organization?

`;
      }

      // Results Section
      content += `## 📊 Discovery Results Format

**Hierarchical Structure:**
\`\`\`
Organizations (${organization_id ? '1 selected' : 'all'})
├── Ledgers (per organization)
│   ├── Assets (per ledger)
│   ├── Accounts (per ledger)
│   │   └── Balances (per account)
│   └── Portfolios (per ledger)
│       └── Account Groupings
\`\`\`

**Summary Statistics:**
${show_counts ? `
- Total Organizations: [count]
- Total Ledgers: [count] 
- Total Assets: [count]
- Total Accounts: [count]
- Total Portfolios: [count]
- Total Balance Value: [amount by asset]
` : '(Statistics disabled)'}

## 🎯 Discovery Workflow

**I'll execute this discovery in sequence:**

1. **Start with Organizations** → Get the foundation
2. **Explore Ledgers** → Understand structure  
3. **Map Assets** → See what's supported
4. **Analyze Accounts** → Review the data holders
5. **Check Portfolios** → Understand groupings
6. **Generate Report** → Comprehensive overview

**Commands Chain:**
\`\`\`
midaz-discover → organizations.list → 
  for each org: ledgers.list → 
    for each ledger: assets.list + accounts.list + portfolios.list →
      for each account: balance lookup
\`\`\`

This gives you a **complete picture** of your Midaz ecosystem! 🚀`;

      return {
        description: `Midaz hierarchy discovery - ${discovery_level} level`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: content
          }
        }]
      };
    }
  );

  // Comprehensive Tools Catalog
  registerMcpPrompt(
    server,
    "show-all-tools",
    "Display the current Lerian MCP tool catalog, prompt surface, and recommended entry points",
    {
      category_filter: z.enum(["all", "financial", "documentation", "learning", "workflow", "discovery"]).optional().describe("Filter tools by category"),
      detail_level: z.enum(["summary", "detailed", "examples"]).optional().describe("Level of detail to show"),
      
    },
    async (args) => {
      const { category_filter = "all", detail_level = "detailed" } = args;
      const surface = getRuntimeSurface();

      const coreTools = surface.tools.filter((tool) => tool.category === 'portfolio' || tool.category === 'workflow');
      const apiTools = surface.tools.filter((tool) => tool.category === 'live-api');
      const prompts = surface.prompts;

      const toolLines = (category_filter === 'workflow'
        ? coreTools
        : category_filter === 'financial'
          ? apiTools
          : surface.tools
      ).map((tool) => `- \`${tool.name}\` (${tool.product}) - ${tool.description}`);

      const promptLines = prompts.map((prompt) => `- \`${prompt.name}\` - ${prompt.description}`);
      const workflowLines = surface.workflows.map((workflow) => `- \`${workflow.id}\` - ${workflow.description}`);
      const productLines = surface.liveProducts.map((product) => `- ${product.name}: ${product.liveToolNames.join(', ')}`);

      const content = `# Lerian MCP Surface Catalog

**Filter:** ${category_filter.toUpperCase()} | **Detail:** ${detail_level.toUpperCase()}

This runtime currently exposes **${surface.toolCount} live tools**, **${surface.promptCount} prompts**, and **${surface.workflowCount} workflows**.

## Runtime Tools

${toolLines.join('\n')}

## Live Product Coverage

${productLines.join('\n')}

## Cross-Product Workflows

${workflowLines.join('\n')}

## Prompt Surface

${promptLines.join('\n')}

## Recommended Entry Points

1. Start with \`lerian\` + \`product="all"\` + \`operation="discover"\`.
2. Use \`portfolio-workflow\` when the task crosses product boundaries.
3. Use the matching \`*-discover\` tool before any \`*-execute\` call.
4. Use the prompts when you want guided Midaz learning and workflow assistance.`;

      return {
        description: `Current Lerian MCP catalog filtered by ${category_filter}`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: content
          }
        }]
      };
    }
  );

  logger.info('✅ Advanced workflow prompts registered');
};
