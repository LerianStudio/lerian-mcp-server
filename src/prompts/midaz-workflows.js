/**
 * Enhanced Midaz Workflow Prompts
 * Contextual, data-driven prompts for common Midaz operations
 */

import { createLogger } from "../util/mcp-logging.js";
import { z } from 'zod';
import { registerMcpPrompt } from '../util/mcp-registration.js';

const logger = createLogger('workflow-prompts');

/**
 * Register enhanced workflow prompts
 */
export const registerWorkflowPrompts = (server) => {

  // Transaction Creation Wizard - Step-by-step transaction builder
  registerMcpPrompt(
    server,
    "create-transaction-wizard",
    "Guide me through creating a transaction step by step with my actual Midaz data",
    {
      organization_id: z.string().optional().describe("Organization ID (will help find your ledgers)"),
      ledger_id: z.string().optional().describe("Ledger ID (will help find your accounts)"),
      transaction_type: z.enum(["transfer", "payment", "deposit", "withdrawal"]).optional().describe("Type of transaction"),
      step: z.number().optional().describe("Current step in the wizard (1-5)")
    },
    async (args) => {
      const { organization_id, ledger_id, transaction_type = "transfer", step = 1 } = args;
      
      // Dynamic content based on step and available data
      let wizardContent = "";
      let nextSteps = "";
      
      switch (step) {
        case 1:
          wizardContent = `# 🧙‍♂️ Transaction Creation Wizard - Step 1/5
          
## Let's Create Your ${transaction_type.toUpperCase()} Transaction!

**Current Step: Organization & Ledger Setup**

${organization_id ? 
  `✅ Using Organization: ${organization_id}\n\n**Next:** I'll help you find the right ledger and accounts.` :
  `**First, let's find your organization:**\n\nUse \`midaz-discover\` to inspect organizations, then \`midaz-execute\` with resource="organizations" and action="list". Re-run this wizard with organization_id parameter.`
}

${ledger_id && organization_id ?
  `✅ Using Ledger: ${ledger_id}\n\n**Ready for Step 2!** Re-run with step=2` :
  organization_id ? 
    `**Next:** Use \`midaz-execute\` with resource="ledgers", action="list", and pathParams={"organizationId":"${organization_id}"} to find your ledger\nThen re-run with both organization_id and ledger_id` :
    ""
}`;
          break;
          
        case 2:
          wizardContent = `# 🧙‍♂️ Transaction Creation Wizard - Step 2/5
          
## Account Selection for ${transaction_type.toUpperCase()}

**Current Step: Find Source & Destination Accounts**

Use \`midaz-execute\` with resource="accounts", action="list", and:
- pathParams.organizationId: "${organization_id}"
- pathParams.ledgerId: "${ledger_id}"

**Look for:**
- **Source Account**: Where money comes FROM
- **Destination Account**: Where money goes TO

**💡 Pro Tips:**
- Check account balances first with \`midaz-execute\` using the balance action contract
- Note the asset types (USD, EUR, etc.)
- Verify account types match your transaction

**Ready?** Re-run wizard with step=3 once you have account IDs`;
          break;
          
        case 3:
          wizardContent = `# 🧙‍♂️ Transaction Creation Wizard - Step 3/5
          
## Transaction Details & Validation

**Current Step: Prepare Transaction Data**

**Required Information:**
1. **Source Account ID**: _[from step 2]_
2. **Destination Account ID**: _[from step 2]_ 
3. **Amount**: How much to transfer
4. **Asset Code**: Currency/asset type (USD, EUR, BTC, etc.)
5. **Description**: Purpose of transaction

**Validation Checklist:**
- [ ] Source account has sufficient balance
- [ ] Both accounts use same asset type
- [ ] Amount is positive number
- [ ] Description is meaningful

**Ready?** Re-run with step=4 to build the transaction`;
          break;
          
        case 4:
          wizardContent = `# 🧙‍♂️ Transaction Creation Wizard - Step 4/5
          
## Build Your Transaction

**Current Step: Create Transaction Object**

Here's your transaction template:

\`\`\`json
{
  "ledger_id": "${ledger_id}",
  "description": "Your transaction description",
  "operations": [
    {
      "account_id": "SOURCE_ACCOUNT_ID",
      "asset_code": "USD", 
      "amount": -100.00,
      "description": "Debit from source"
    },
    {
      "account_id": "DESTINATION_ACCOUNT_ID", 
      "asset_code": "USD",
      "amount": 100.00,
      "description": "Credit to destination"
    }
  ]
}
\`\`\`

**Next:** Use transaction creation tools with this structure
**Ready?** Re-run with step=5 for execution guidance`;
          break;
          
        case 5:
          wizardContent = `# 🧙‍♂️ Transaction Creation Wizard - Step 5/5
          
## Execute & Verify

**Current Step: Create and Verify Transaction**

**Execute Transaction:**
Use transaction creation tools with your prepared data structure.

**Verification Steps:**
1. **Check Transaction**: Use \`midaz-execute\` with resource="transactions", action="get", and the returned transaction ID
2. **Verify Balances**: Use \`midaz-execute\` with the balance action contract on both accounts
3. **Review Operations**: Use \`midaz-execute\` with resource="operations" and action="list" to see transaction history

**🎉 Success Indicators:**
- Transaction status: "completed"
- Source balance decreased correctly
- Destination balance increased correctly
- Operations list shows both debit/credit entries

**Troubleshooting:** If issues occur, try \`debug-my-balance\` prompt for help!`;
          break;
      }
      
      return {
        description: `Transaction creation wizard - Step ${step} of 5`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: wizardContent
          }
        }]
      };
    }
  );

  // Balance Debugging Assistant
  registerMcpPrompt(
    server,
    "debug-my-balance",
    "Help me understand and troubleshoot balance issues with my accounts",
    {
      organization_id: z.string().describe("Organization ID to check"),
      ledger_id: z.string().describe("Ledger ID to check"),
      account_id: z.string().optional().describe("Specific account ID to debug"),
      issue_type: z.enum(["wrong_balance", "missing_transactions", "unexpected_amount", "zero_balance"]).optional().describe("Type of balance issue")
    },
    async (args) => {
      const { organization_id, ledger_id, account_id, issue_type = "wrong_balance" } = args;
      
      const debugContent = `# 🔍 Balance Debugging Assistant

## Current Issue: ${issue_type.replace('_', ' ').toUpperCase()}

**Configuration:**
- Organization: ${organization_id}
- Ledger: ${ledger_id}
${account_id ? `- Account: ${account_id}` : '- Account: [Will analyze all accounts]'}

## 🔧 Diagnostic Steps

### 1. Get Current Balance
${account_id ? 
  `Use \`midaz-execute\` with the balance action contract and pathParams={"organizationId":"${organization_id}","ledgerId":"${ledger_id}","accountId":"${account_id}"}` :
  `Use \`midaz-execute\` with resource="accounts", action="list", and pathParams={"organizationId":"${organization_id}","ledgerId":"${ledger_id}"} to see all accounts`
}

### 2. Review Transaction History
Use \`midaz-execute\` with resource="operations" and action="list" using:
- pathParams.organizationId: "${organization_id}"
- pathParams.ledgerId: "${ledger_id}"
${account_id ? `- pathParams.accountId: "${account_id}"` : ''}

### 3. Check Recent Transactions
Use \`midaz-execute\` with resource="transactions" and action="list" plus date filters to see recent activity

## 🎯 Common Issues & Solutions

**Wrong Balance:**
- Verify all transactions posted correctly
- Check for pending/failed operations
- Ensure double-entry accounting rules applied

**Missing Transactions:**
- Check transaction status (pending, completed, failed)
- Verify account IDs in operations
- Look for transactions in different date ranges

**Unexpected Amount:**
- Review asset codes (USD vs EUR vs BTC)
- Check decimal precision and formatting
- Verify operation amounts match transaction description

**Zero Balance:**
- Confirm account has been used in transactions
- Check if initial funding transactions occurred
- Verify account type allows balance changes

## 📊 Analysis Tools

After gathering data above, use:
- \`explain-my-data\` prompt to interpret results
- Compare against expected business logic
- Check audit logs for administrative changes

**Need more help?** Run this prompt again with specific findings!`;

      return {
        description: `Balance debugging for ${issue_type}`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: debugContent
          }
        }]
      };
    }
  );

  // Organization Setup Wizard
  registerMcpPrompt(
    server,
    "setup-my-org",
    "Guide me through setting up a new organization with ledgers, accounts, and initial configuration",
    {
      org_name: z.string().optional().describe("Name for the new organization"),
      business_type: z.enum(["fintech", "ecommerce", "gaming", "marketplace", "traditional"]).optional().describe("Type of business"),
      setup_stage: z.enum(["planning", "organization", "ledger", "accounts", "assets", "complete"]).optional().describe("Current setup stage")
    },
    async (args) => {
      const { org_name, business_type, setup_stage = "planning" } = args;
      
      let setupContent = "";
      
      switch (setup_stage) {
        case "planning":
          setupContent = `# 🏗️ Organization Setup Wizard - Planning Phase

## Let's Plan Your Midaz Organization!

**Business Type:** ${business_type || "[Please specify]"}
**Organization Name:** ${org_name || "[Please specify]"}

### 📋 Setup Checklist
- [ ] **Organization**: Create main org entity
- [ ] **Ledger**: Set up primary ledger
- [ ] **Assets**: Define currencies/tokens  
- [ ] **Accounts**: Create account structure
- [ ] **Portfolios**: Organize account groups
- [ ] **Initial Data**: Fund accounts if needed

### 🎯 Business-Specific Recommendations

${business_type === "fintech" ? `
**Fintech Setup:**
- Multi-currency support (USD, EUR, etc.)
- Customer wallet accounts
- Fee collection accounts
- Regulatory compliance accounts` : 
business_type === "gaming" ? `
**Gaming Setup:**
- Virtual currency assets (coins, gems, etc.)
- Player wallet accounts
- Game economy accounts (store, rewards)
- Tournament prize accounts` :
business_type === "ecommerce" ? `
**E-commerce Setup:**
- Payment processing accounts
- Merchant accounts by seller
- Fee and commission accounts
- Refund and chargeback accounts` : `
**Traditional Business:**
- Standard accounting structure
- Asset, liability, equity accounts
- Revenue and expense tracking
- Multi-location support if needed`}

**Ready to start?** Re-run with setup_stage="organization"`;
          break;
          
        case "organization":
          setupContent = `# 🏗️ Organization Setup Wizard - Create Organization

## Step 1: Create Your Organization

Use organization creation tools with this structure:

\`\`\`json
{
  "name": "${org_name || 'Your Organization Name'}",
  "code": "${org_name ? org_name.toLowerCase().replace(/\s+/g, '-') : 'your-org-code'}",
  "description": "Organization for ${business_type || 'business'} operations",
  "metadata": {
    "business_type": "${business_type || 'traditional'}",
    "setup_date": "${new Date().toISOString()}",
    "created_by": "midaz-setup-wizard"
  }
}
\`\`\`

**After creation:**
1. Note the organization_id returned
2. Re-run wizard with setup_stage="ledger" and the org_id

**Next:** We'll create your primary ledger structure`;
          break;
          
        case "ledger":
          setupContent = `# 🏗️ Organization Setup Wizard - Create Ledger

## Step 2: Create Primary Ledger

Your ledger will contain all accounts and transactions.

**Recommended Structure:**
\`\`\`json
{
  "name": "${business_type || 'Primary'} Ledger",
  "description": "Main ledger for ${org_name || 'organization'} operations",
  "metadata": {
    "ledger_type": "primary",
    "business_type": "${business_type || 'traditional'}"
  }
}
\`\`\`

**After creation:**
1. Note the ledger_id returned  
2. Re-run wizard with setup_stage="assets"

**Next:** We'll define your assets (currencies/tokens)`;
          break;
          
        case "accounts":
          setupContent = `# 🏗️ Organization Setup Wizard - Create Accounts

## Step 4: Create Account Structure

**Essential Accounts for ${business_type || 'business'}:**

${business_type === "fintech" ? `
- **Customer Wallets**: Individual user accounts
- **Operating Account**: Business operations
- **Fee Account**: Transaction fees
- **Reserve Account**: Regulatory reserves` :
business_type === "gaming" ? `
- **Player Wallets**: Individual player accounts  
- **Game Treasury**: Central game funds
- **Reward Pool**: Prize and bonus account
- **Store Revenue**: In-app purchase income` : `
- **Operating Account**: Main business account
- **Revenue Account**: Income tracking
- **Expense Account**: Cost tracking  
- **Customer Accounts**: Per-customer balances`}

**Account Creation Pattern:**
\`\`\`json
{
  "name": "Account Name",
  "type": "asset", // or "liability", "equity"
  "code": "account-code",
  "metadata": {
    "purpose": "account purpose",
    "category": "operational"
  }
}
\`\`\`

**Next:** Re-run with setup_stage="complete" when accounts are created`;
          break;
          
        case "complete":
          setupContent = `# 🏗️ Organization Setup Wizard - Complete! 🎉

## ✅ Setup Verification Checklist

**Verify your setup:**
1. **Organization**: Use \`midaz-execute\` with resource="organizations" and action="get" to confirm details
2. **Ledger**: Use \`midaz-execute\` with resource="ledgers" and action="get" to verify configuration  
3. **Assets**: Use \`midaz-execute\` with resource="assets" and action="list" to see available currencies
4. **Accounts**: Use \`midaz-execute\` with resource="accounts" to review structure
5. **Balances**: Use \`midaz-execute\` with the balance action contract to check initial state

## 🚀 Next Steps

**Start Using Your Setup:**
- Create your first transaction with \`create-transaction-wizard\`
- Monitor balances with \`debug-my-balance\`
- Explore your data with \`explain-my-data\`

**Advanced Features:**
- Set up portfolios for account organization
- Configure webhooks for real-time updates
- Implement business-specific workflows

**🎯 You're Ready!** Your Midaz organization is configured and ready for operations.`;
          break;
      }
      
      return {
        description: `Organization setup wizard - ${setup_stage} stage`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: setupContent
          }
        }]
      };
    }
  );

  // Data Explanation Assistant
  registerMcpPrompt(
    server,
    "explain-my-data",
    "Help me understand my current Midaz data, balances, and transaction patterns",
    {
      organization_id: z.string().describe("Organization ID to analyze"),
      ledger_id: z.string().optional().describe("Specific ledger to focus on"),
      analysis_type: z.enum(["overview", "balances", "transactions", "patterns", "health"]).optional().describe("Type of analysis to perform"),
      time_period: z.enum(["today", "week", "month", "quarter", "all"]).optional().describe("Time period for analysis")
    },
    async (args) => {
      const { organization_id, ledger_id, analysis_type = "overview", time_period = "month" } = args;
      
      const explanationContent = `# 📊 Data Analysis Assistant

## ${analysis_type.toUpperCase()} Analysis for ${time_period.toUpperCase()}

**Scope:**
- Organization: ${organization_id}
${ledger_id ? `- Ledger: ${ledger_id}` : '- All Ledgers'}

## 🔍 Analysis Steps

### 1. Gather Your Data
${analysis_type === "overview" ? `
**Get Complete Picture:**
- \`midaz-execute\` organizations.list - Verify org details
- \`midaz-execute\` ledgers.list - See all ledgers  
- \`midaz-execute\` accounts.list - Review account structure
- \`midaz-execute\` assets.list - Check available currencies` :

analysis_type === "balances" ? `
**Balance Analysis:**
- \`midaz-execute\` accounts.list - See all account balances
- \`midaz-execute\` balance lookup - Check specific accounts
- Compare current vs expected balances` :

analysis_type === "transactions" ? `
**Transaction Analysis:**
- \`midaz-execute\` transactions.list with date filters for ${time_period}
- \`midaz-execute\` operations.list to see detailed movements
- \`midaz-execute\` transactions.get for specific transaction details` :

analysis_type === "patterns" ? `
**Pattern Analysis:**
- \`midaz-execute\` transactions.list across ${time_period}
- Group by account types, amounts, frequencies
- Look for unusual transaction patterns` : `
**Health Check:**
- Verify all balances reconcile
- Check for failed transactions
- Review system performance metrics`}

### 2. Data Interpretation Guide

**🟢 Healthy Indicators:**
- Balances match expected business logic
- Double-entry accounting principles maintained
- Transaction success rates high
- No orphaned or unbalanced operations

**🟡 Watch Areas:**
- Large balance changes without clear transactions
- High frequency of small transactions (possible spam)
- Accounts with zero balances that should have activity
- Asset mismatches between operations

**🔴 Issues to Investigate:**
- Negative balances in asset accounts
- Missing counter-operations in transactions
- Failed transaction rates above 5%
- Significant unexplained balance differences

### 3. Business Intelligence

**Key Metrics to Calculate:**
- Total volume by asset type
- Average transaction size
- Most active accounts
- Balance distribution across accounts
- Transaction frequency patterns

**Questions to Ask:**
- Do the numbers match your business expectations?
- Are there seasonal or time-based patterns?
- Which accounts drive the most activity?
- Are fee structures working as intended?

## 📈 Action Items

After gathering data:
1. **Compare to Business Goals**: Do metrics align with expectations?
2. **Identify Optimization Opportunities**: Where can processes improve?
3. **Plan Next Steps**: What business decisions do the numbers support?

**Need specific analysis?** Re-run with different analysis_type or use \`debug-my-balance\` for targeted troubleshooting.`;

      return {
        description: `Data analysis - ${analysis_type} for ${time_period}`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: explanationContent
          }
        }]
      };
    }
  );

  logger.info('✅ Enhanced workflow prompts registered');
};
