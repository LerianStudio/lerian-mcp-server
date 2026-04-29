# Lerian MCP Server

**An MCP gateway for Lerian portfolio discovery, documentation, learning, SDK examples, live product API access, and cross-product workflows.**

This server connects MCP clients such as Claude Desktop, Cursor, Windsurf, Continue, and ChatGPT Desktop to the Lerian product portfolio. It gives AI assistants a structured way to discover Lerian products, read official documentation, generate implementation examples, inspect live API contracts, execute configured product APIs, and guide multi-product operational workflows.

> **Runtime scope:** this server is not documentation-only. The unified `lerian` tool is read-oriented, but product-specific `*-execute` tools can call configured live Lerian APIs. Mutating API calls require explicit confirmation and an audit reason.

---

## 2-Minute Setup

1. Choose your MCP-compatible AI assistant.
2. Add the server configuration.
3. Restart the AI app.
4. Ask: "What can you tell me about Lerian Midaz?"

### Claude Desktop

macOS location: `~/Library/Application Support/Claude/claude_desktop_config.json`

Windows location: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npx",
      "args": ["-y", "@lerianstudio/lerian-mcp-server@latest"]
    }
  }
}
```

### Cursor, Windsurf, Continue, ChatGPT Desktop

Add the same MCP server block to your client's MCP configuration:

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npx",
      "args": ["-y", "@lerianstudio/lerian-mcp-server@latest"]
    }
  }
}
```

---

## What You Get

### Supported Products

- **Midaz**: financial ledger platform with onboarding, balances, transactions, CRM, and ledger services.
- **Fetcher**: datasource connection, schema discovery, and asynchronous extraction service.
- **Reporter**: template-driven report generation, datasource management, metrics, and artifacts.
- **Matcher**: reconciliation engine for matching Midaz transactions against external systems.
- **Tracer**: transaction validation engine with rules, limits, validations, and auditability.
- **Flowker**: workflow orchestration platform for providers, executors, webhooks, and execution flows.
- **Underwriter**: jurisdiction-aware lending surface for loan products and schedule preview.
- **All**: portfolio-wide discovery, documentation search, and comparison.

### Core Capabilities

- **Portfolio discovery** through `lerian` with `operation="discover"`.
- **Documentation lookup** through `lerian` with `operation="docs"`.
- **Guided learning** through `lerian` with `operation="learn"`.
- **SDK examples** through `lerian` with `operation="sdk"`.
- **Cross-product search** through `lerian` with `operation="search"`.
- **Live API contract discovery** through product-specific `*-discover` tools.
- **Live API execution** through product-specific `*-execute` tools.
- **Cross-product workflows** through `portfolio-workflow`.
- **Prompt-based guidance** for onboarding, learning, API use, and operational workflows.

---

## Runtime Tool Surface

The server exposes a small core plus live API pairs for each supported product.

### Core Tools

- `lerian`: unified portfolio tool for docs, learning, SDK examples, discovery, and search.
- `portfolio-workflow`: cross-product workflow discovery, planning, stateful sessions, and step execution.

### Live API Tools

- `midaz-discover` and `midaz-execute`
- `fetcher-discover` and `fetcher-execute`
- `reporter-discover` and `reporter-execute`
- `matcher-discover` and `matcher-execute`
- `tracer-discover` and `tracer-execute`
- `flowker-discover` and `flowker-execute`
- `underwriter-discover` and `underwriter-execute`

Use the matching `*-discover` tool before calling a `*-execute` tool. Discovery returns resources, actions, path parameters, query parameters, body schemas, examples, and execution hints.

---

## The `lerian` Tool

The `lerian` tool is the primary read-oriented entry point.

```text
Tool: lerian

Parameters:
  product          midaz | fetcher | reporter | matcher | tracer | flowker | underwriter | all
  operation        discover | docs | learn | sdk | search
  topic            Topic to inspect, learn, or search
  language         go | typescript | javascript, for SDK examples
  useCase          Specific implementation scenario for SDK examples
  experienceLevel  beginner | intermediate | advanced
  format           summary | detailed | examples-only
  includeExamples  true | false
  maxResults       1-50, for search
```

Example:

```json
{
  "product": "midaz",
  "operation": "learn",
  "topic": "transactions",
  "experienceLevel": "beginner"
}
```

---

## Live API Workflow

Live API access is intentionally two-step.

1. Inspect the product surface:

```json
{
  "intent": "list-resources"
}
```

2. Inspect a specific action contract:

```json
{
  "intent": "describe-action",
  "resource": "transactions",
  "action": "create"
}
```

3. Execute with the exact contract returned by discovery:

```json
{
  "resource": "transactions",
  "action": "create",
  "pathParams": {
    "organizationId": "...",
    "ledgerId": "..."
  },
  "body": {
    "description": "Example transaction"
  },
  "confirmMutation": true,
  "mutationReason": "Create example transaction requested by operator"
}
```

Mutating live API actions require:

- `confirmMutation: true`
- `mutationReason` with a human-readable audit reason

---

## Cross-Product Workflows

Use `portfolio-workflow` when the task spans multiple Lerian products.

Current workflows:

- `fetcher-to-reporter`: validate extraction mappings with Fetcher, then generate or inspect Reporter reports.
- `matcher-to-fetcher-to-midaz`: configure Matcher reconciliation, use Matcher discovery over Fetcher, and inspect Midaz ledger-side data.

Supported intents:

- `list-workflows`
- `describe-workflow`
- `plan`
- `create-session`
- `get-session`
- `list-sessions`
- `execute-step`
- `execute-next`

Workflow sessions return an opaque `sessionToken`. Keep it private.

---

## Configuration

The server works immediately for documentation and discovery. Live API execution requires reachable product services and, where applicable, tokens or API keys.

Configuration sources, in priority order:

- Command-line `--config` or `--config-file`
- Environment variables
- `./lerian-mcp-config.json`
- `./midaz-mcp-config.json`
- `~/.lerian/mcp-config.json`
- `~/.midaz/mcp-config.json`
- `~/.config/lerian/mcp-config.json`
- `~/.config/midaz/mcp-config.json`
- Platform global config paths

Create or update configuration interactively:

```bash
npx -y -p @lerianstudio/lerian-mcp-server@latest lerian-mcp-config
```

Common environment variables:

```bash
LERIAN_DOCS_URL=https://docs.lerian.studio
LOG_LEVEL=info

MIDAZ_ONBOARDING_URL=http://localhost:3000
MIDAZ_TRANSACTION_URL=http://localhost:3001
MIDAZ_CRM_URL=http://localhost:3002
MIDAZ_LEDGER_URL=http://localhost:3003
MIDAZ_AUTH_TOKEN=...

FETCHER_MANAGER_URL=http://localhost:4006
FETCHER_AUTH_TOKEN=...

REPORTER_MANAGER_URL=http://localhost:4005
REPORTER_AUTH_TOKEN=...

MATCHER_BASE_URL=http://localhost:4018
MATCHER_AUTH_TOKEN=...

TRACER_BASE_URL=http://localhost:4020
TRACER_API_KEY=...

FLOWKER_BASE_URL=http://localhost:4021
FLOWKER_AUTH_TOKEN=...
FLOWKER_API_KEY=...

UNDERWRITER_BASE_URL=http://localhost:8080
UNDERWRITER_AUTH_TOKEN=...
```

---

## Safety Model

- Live execution is opt-in through product-specific `*-execute` tools.
- Mutating methods require explicit confirmation and a mutation reason.
- Product API base URLs must use `http` or `https`.
- Non-localhost HTTP URLs are rejected; HTTPS is required outside local development.
- URLs with embedded credentials are rejected.
- Authorization and API-key headers are protected from arbitrary override.
- Binary upload and download sizes are bounded by configurable limits.
- Secrets are generated and managed locally under `~/.lerian/secrets.json` when needed.

---

## Example Conversations

### Portfolio Discovery

**You:** "What Lerian products can this MCP help with?"

**AI:** Uses `lerian` with `product="all"`, `operation="discover"`.

### Learning Path

**You:** "I'm new to Tracer. Teach me how validation rules work."

**AI:** Uses `lerian` with `product="tracer"`, `operation="learn"`, `topic="rules"`.

### SDK Example

**You:** "Show me Go code for creating a Midaz ledger."

**AI:** Uses `lerian` with `product="midaz"`, `operation="sdk"`, `language="go"`.

### Live API Contract Discovery

**You:** "Inspect the contract for creating a Reporter template."

**AI:** Uses `reporter-discover` before any `reporter-execute` call.

### Cross-Product Workflow

**You:** "Guide me through validating Fetcher mappings before generating a report."

**AI:** Uses `portfolio-workflow` with `workflow="fetcher-to-reporter"`.

---

## Development

Requires Node.js `>=20.19.0`.

```bash
npm ci
npm run build
npm test
```

Useful scripts:

- `npm run dev`: run the TypeScript entrypoint with `ts-node`.
- `npm run build`: compile to `dist/` and mark binaries executable.
- `npm run lint`: run ESLint.
- `npm run typecheck`: run TypeScript without emitting files.
- `npm test`: run Node tests plus the basic server test.
- `npm run docs`: generate TypeDoc output into `docs/`.

---

## Documentation

- [Full Documentation](https://docs.lerian.studio)
- [Learning Paths](https://docs.lerian.studio/learn)
- [SDK Reference](https://docs.lerian.studio/sdks)
- [Troubleshooting](https://docs.lerian.studio/troubleshooting)
- [Media and Diagram Index](docs/media/README.md)
- [Agent Instructions](AGENTS.md)

---

## Package Information

- **npm package:** `@lerianstudio/lerian-mcp-server`
- **Current package version:** `3.4.0`
- **Runtime:** Node.js ESM
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **License:** Apache-2.0
- **Repository:** [github.com/lerianstudio/lerian-mcp-server](https://github.com/lerianstudio/lerian-mcp-server)

---

## Architecture Summary

```text
MCP Client
  -> stdio transport
  -> McpServer from @modelcontextprotocol/sdk
  -> core tools and prompts
  -> product adapters
  -> product routers and schema registries
  -> configured Lerian product APIs
```

Primary layers:

1. **Transport:** MCP JSON-RPC over stdio.
2. **Server bootstrap:** security, secrets, docs manifest, logging, client detection.
3. **Core tools:** `lerian` and `portfolio-workflow`.
4. **Product adapters:** discover/execute pairs for supported products.
5. **Schema registries:** resource/action contracts for API surfaces.
6. **HTTP execution:** validated URL construction, request execution, response parsing, and error classification.
7. **Workflow orchestration:** guided, stateful multi-product flows.

---

## Troubleshooting

### Server Not Starting

Check Node.js version:

```bash
node --version
```

Run manually:

```bash
npx -y @lerianstudio/lerian-mcp-server@latest
```

Check local secrets:

```bash
ls -la ~/.lerian/secrets.json
```

### Live API Calls Failing

- Use the product `*-discover` tool first.
- Verify the relevant base URL and token/API key are configured.
- Confirm non-local remote URLs use HTTPS.
- For mutations, include `confirmMutation=true` and `mutationReason`.
- Check whether the target product service is reachable from the MCP runtime.

### Tool Not Responding In The Client

- Restart the MCP client after configuration changes.
- Confirm MCP is enabled in the client.
- Enable logging with `LOG_LEVEL=debug` if needed.
- Check `./logs/` when logging is enabled.
