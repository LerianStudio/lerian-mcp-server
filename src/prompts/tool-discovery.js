/**
 * Tool Discovery Prompts
 * Helps users discover and understand available tools
 * 
 * @since 3.0.0 - Updated for Lerian branding
 */

import { createLogger } from "../util/mcp-logging.js";
import { z } from 'zod';
import { listProducts } from '../catalog/product-registry.js';
import { getRuntimeSurface } from '../runtime/surface-registry.js';
import { registerMcpPrompt } from '../util/mcp-registration.js';

const logger = createLogger('prompts');

/**
 * Register discovery prompts
 */
export const registerDiscoveryPrompts = (server) => {

  // Main help prompt - more intuitive name
  registerMcpPrompt(
    server,
    "help-me-start",
    "Show me what I can do with this Lerian MCP server and how to get started quickly",
    undefined,
    async () => {
      const surface = getRuntimeSurface();
      const liveCommandSummary = surface.liveApiPairs
        .flatMap((pair) => {
          const name = `${pair.product.charAt(0).toUpperCase() + pair.product.slice(1)}`;
          return [
            `- **${name} live discovery** -> \`${pair.discover}\` with \`intent="list-resources"\``,
            `- **${name} live execution** -> first inspect with \`${pair.discover}\`, then call \`${pair.execute}\``
          ];
        })
        .join('\n');
      const productSummary = listProducts()
        .map((product) => `- **${product.name}** - ${product.description}`)
        .join('\n');
      const toolSummary = surface.tools
        .map((tool) => `- **\`${tool.name}\`** - ${tool.description}`)
        .join('\n');
      const workflowSummary = surface.workflows
        .map((workflow) => `- **\`${workflow.id}\`** - ${workflow.description}`)
        .join('\n');
      const liveProductNames = surface.liveProducts.map((product) => product.name).join(', ');

      return {
        description: "Quick start guide with essential tools and common workflows for Lerian",
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `# Quick Start with Lerian MCP Server

## Current Runtime Surface

This MCP currently exposes **${surface.toolCount} live tools**:

${toolSummary}

It also exposes **${surface.promptCount} prompts** and **${surface.workflowCount} workflow(s)**.

## Best Starting Commands

- **Portfolio overview** -> \`lerian\` with \`product="all"\`, \`operation="discover"\`
- **Product docs** -> \`lerian\` with \`product="midaz"\`, \`operation="docs"\`, \`topic="transactions"\`
- **Cross-product search** -> \`lerian\` with \`product="all"\`, \`operation="search"\`, \`topic="authentication"\`
${liveCommandSummary}
- **Cross-product flow** -> \`portfolio-workflow\` with \`intent="describe-workflow"\`, \`workflow="matcher-to-fetcher-to-midaz"\`

## Workflow Surface

${workflowSummary}

## Lerian Portfolio Covered By Discovery

${productSummary}

## Important Notes

- **Live API access is currently available for ${liveProductNames}** in this runtime.
- \`lerian\` remains the fastest entry point for conceptual docs, portfolio-wide discovery, and search.
- Live adapters now include Underwriter and Flowker alongside the earlier product surfaces.
- Cross-product workflow support now includes **Fetcher -> Reporter** and **Matcher -> Fetcher -> Midaz**.

## Next Steps

1. Use \`help-with-api\` if you want live product API guidance.
2. Use \`help-me-learn\` if you want a guided learning path.
3. Use \`show-all-tools\` if you want the current catalog of tools and prompts.`
          }
        }]
      };
    }
  );

  // API-specific help prompt - more intuitive name
  registerMcpPrompt(
    server,
    "help-with-api",
    "Show me how to use the live product API tools in this MCP server",
    undefined,
    async () => {
      const surface = getRuntimeSurface();
      const apiPairs = surface.liveApiPairs
        .map((pair, index) => `${index + 1}. **${pair.product.charAt(0).toUpperCase() + pair.product.slice(1)}**\n   - \`${pair.discover}\`\n   - \`${pair.execute}\``)
        .join('\n\n');

      return {
        description: "Practical guide to the current live API workflow across the portfolio adapters",
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `# Live Product API Quick Reference Guide

## Live API Support In This MCP

This runtime currently gives you ${surface.liveApiPairs.length} live product API pair(s):

${apiPairs}

Use the unified \`lerian\` tool for conceptual docs, search, and learning. Use the product-specific tools when you need live API access.

## Recommended Sequence

1. **Choose the product**
   - Midaz for ledger and transaction operations
   - Fetcher for connection/schema/extraction control
   - Reporter for templates, reports, deadlines, and metrics
   - Matcher for reconciliation contexts, sources, matching, governance, reporting, and discovery-over-Fetcher
   - Tracer for rules, limits, validations, and audit investigation
   - Flowker for workflow orchestration, provider/executor configuration, runtime execution, audit, dashboards, and webhooks
   - Underwriter for jurisdictions, loan products, and schedule preview simulation

2. **List that product's resources**
   - \`<product>-discover\` with \`intent="list-resources"\`

3. **Inspect one resource**
   - \`<product>-discover\` with \`intent="describe-resource"\`, \`resource="..."\`

4. **Inspect one action contract**
   - \`<product>-discover\` with \`intent="describe-action"\`, \`resource="..."\`, \`action="..."\`

5. **Execute the action**
   - \`<product>-execute\` with the exact \`resource\`, \`action\`, \`pathParams\`, \`queryParams\`, and payload you just inspected

## Product-Specific Notes

- **Midaz**
  - discover + execute over a metadata-driven API contract

- **Fetcher**
  - many actions require \`organizationId\`
  - some also require \`productName\`

- **Reporter**
  - template create/update uses \`multipart\`
  - report download returns binary content metadata
  - optional idempotency headers can be passed through \`headers\`

- **Tracer**
  - auth uses \`X-API-Key\`
  - validation payloads are richer than simple CRUD bodies
  - audit endpoints support deep filtering for investigation

- **Matcher**
  - auth uses bearer tokens
  - many endpoints accept \`X-Request-Id\` for tracing
  - the current live slice includes contexts, sources, field maps, discovery-over-Fetcher, matching, governance, reporting, and system surfaces

- **Flowker**
  - auth can use bearer tokens or \`X-API-Key\`
  - starting workflow executions requires \`Idempotency-Key\`
  - webhook calls are method-aware and can use nested path segments

- **Underwriter**
  - jurisdictions and health endpoints are public
  - loan products, schedule preview, and examples are bearer-protected in the mounted runtime
  - schedule preview expects decimal amounts as strings and returns the effective payload wrapped in \`data\`

## Common Discovery Examples

- **See Midaz resources**
  - \`midaz-discover\` with \`intent="list-resources"\`

- **Inspect Fetcher job creation**
  - \`fetcher-discover\` with \`intent="describe-action"\`, \`resource="fetcher-jobs"\`, \`action="create"\`

- **Inspect Reporter template upload**
  - \`reporter-discover\` with \`intent="describe-action"\`, \`resource="templates"\`, \`action="create"\`

- **Inspect Tracer validation request**
  - \`tracer-discover\` with \`intent="describe-action"\`, \`resource="validations"\`, \`action="create"\`

- **Inspect Matcher discovery extraction**
  - \`matcher-discover\` with \`intent="describe-action"\`, \`resource="discovery"\`, \`action="startExtraction"\`

- **Inspect Flowker workflow execution start**
  - \`flowker-discover\` with \`intent="describe-action"\`, \`resource="executions"\`, \`action="start"\`

- **Inspect Underwriter schedule preview**
  - \`underwriter-discover\` with \`intent="describe-action"\`, \`resource="loan-applications"\`, \`action="previewSchedule"\`

## Cross-Product Workflows

- Use \`portfolio-workflow\` when the task crosses products.
- Live workflows currently are \`fetcher-to-reporter\` and \`matcher-to-fetcher-to-midaz\`.

## Practical Advice

1. Discover the contract first.
2. Copy the exact required path params, query params, and payload shape.
3. Execute with the matching \`*-execute\` tool.
4. If it fails, go back to the matching \`*-discover\` tool and inspect the action again.
5. Use \`lerian\` for conceptual docs and \`portfolio-workflow\` for cross-product orchestration.

Ask me to inspect a resource/action pair and I can walk you through the live contract before execution.`
          }
        }]
      };
    }
  );

  // Learning help prompt - more intuitive name
  registerMcpPrompt(
    server,
    "help-me-learn",
    "Get personalized Lerian learning guidance based on your role and experience",
    {
      role: z.enum(["developer", "admin", "business", "explorer"]).optional().describe("Your primary role (developer, admin, business, explorer)"),
      experience: z.enum(["beginner", "intermediate", "advanced"]).optional().describe("Your experience level (beginner, intermediate, advanced)")
    },
    async (args) => {
      const role = args.role || "developer";
      const experience = args.experience || "beginner";
      const sdkProducts = listProducts()
        .filter((product) => Array.isArray(product.sdkLanguages) && product.sdkLanguages.length > 0)
        .map((product) => `${product.name} (${product.sdkLanguages.join(', ')})`)
        .join(', ');

      return {
        description: `Personalized Lerian learning path for ${role} at ${experience} level`,
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: `# Personalized Lerian Learning Path

**Role**: ${role} | **Experience**: ${experience}

## 🎯 Recommended Learning Approach
1. Start with \`lerian\` + \`product="all"\` + \`operation="discover"\`
2. Pick the product you care about
3. Use \`lerian\` + \`operation="learn"\` or \`operation="docs"\` with a concrete topic

## 📚 Learning Options

### Quick Start (5-15 min)
- **Portfolio overview**: \`lerian\` + \`product="all"\` + \`operation="discover"\`
- **Concepts**: \`lerian\` + specific \`product\` + \`operation="learn"\`
- **SDK examples**: \`lerian\` + \`operation="sdk"\` only for products with SDK support: ${sdkProducts || 'none currently advertised'}

### Deep Learning (30 min+)
- **Documentation deep dive**: \`lerian\` + specific \`product\` + \`operation="docs"\`
- **Cross-product search**: \`lerian\` + \`product="all"\` + \`operation="search"\`
- **Portfolio patterns**: search by topic like \`transactions\`, \`templates\`, \`rules\`, or \`workflows\`

### Hands-On Practice
- **Live Product APIs**: use the matching \`<product>-discover\` tool and then the matching \`<product>-execute\` tool
- **Code Generation**: use \`lerian\` + \`operation="sdk"\` only when the selected product advertises SDK languages
- **Troubleshooting**: use \`lerian\` + \`operation="docs"\` or \`operation="search"\` with the failure topic

## 🔍 Smart Search
Try queries like:
- "How do I create transactions?"
- "How does Reporter template validation work?"
- "Show me Fetcher schema exploration examples"
- "Explain Tracer rule evaluation"

## 🎓 Next Steps
1. Choose your preferred learning style above
2. Ask me to use the specific tools with your parameters
3. Practice with the API tools
4. Follow the product-specific workflow prompts if you are working in one product today

Ready to start learning? Tell me which approach interests you most!`
          }
        }]
      };
    }
  );

  logger.info('✅ Discovery prompts registered');
};
