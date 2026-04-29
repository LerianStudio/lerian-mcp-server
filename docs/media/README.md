# Lerian MCP Server - Media And Diagram Index

This directory is reserved for visual documentation of the Lerian MCP Server. The current runtime is a portfolio-aware MCP server that combines documentation, product discovery, live API execution, and cross-product workflow orchestration.

At the moment, this directory only contains this index. Add diagram files here when architecture or sequence diagrams are produced.

## Current Runtime Surface

- **Transport:** MCP JSON-RPC over stdio.
- **Server entrypoint:** `src/index.ts`.
- **Package binary:** `lerian-mcp-server` from `src/bin/lerian-mcp-server.js`.
- **Core tools:** `lerian` and `portfolio-workflow`.
- **Live API pairs:** discover/execute tools for Midaz, Fetcher, Reporter, Matcher, Tracer, Flowker, and Underwriter.
- **Prompt families:** tool discovery, Midaz workflow guidance, and advanced workflow guidance.
- **Workflow layer:** stateful cross-product sessions for guided multi-step execution.

## Recommended Diagram Set

When adding diagrams, keep them aligned with the implementation and use these names:

- `mcp-startup-flow.md`: process startup, configuration loading, security initialization, docs manifest loading, tool registration, and stdio connection.
- `tool-discovery-flow.md`: `lerian`, `*-discover`, runtime surface registry, product registry, and schema registry interactions.
- `live-api-execution-flow.md`: `*-execute`, action validation, mutation confirmation, URL construction, auth headers, HTTP execution, response parsing, and error classification.
- `portfolio-workflow-flow.md`: workflow listing, planning, session creation, step execution, artifact capture, and session token handling.
- `documentation-flow.md`: `llms.txt` manifest loading, static fallback, docs fetching, search, learning, SDK example generation, and formatting.
- `configuration-flow.md`: command-line config, environment variables, local/user config files, legacy Midaz config paths, and default values.
- `security-flow.md`: secret initialization, input validation, URL safety, mutation audit headers, output sanitization, and protected header handling.
- `client-adaptation-flow.md`: MCP client detection and response adaptation.
- `error-handling-flow.md`: startup errors, tool errors, product execution errors, and graceful shutdown.
- `product-adapter-map.md`: relationship between product adapters, discover tools, execute tools, routers, schemas, and clients.

## Architecture Snapshot

```text
MCP Client
  -> stdio JSON-RPC
  -> McpServer
  -> server bootstrap
       -> config
       -> secrets
       -> security
       -> docs manifest
       -> logging
       -> client detection
  -> tool registry
       -> lerian
       -> portfolio-workflow
       -> product discover/execute tools
  -> product adapters
       -> routers
       -> schema registries
       -> HTTP clients
  -> configured Lerian product APIs
```

## Product Adapter Coverage

- **Midaz:** organizations, ledgers, assets, accounts, transactions, balances, holders, aliases, account types, operation routes, transaction routes, metadata indexes, and related ledger/CRM surfaces.
- **Fetcher:** connections, connection migrations, fetcher jobs, schema validation, and extraction control.
- **Reporter:** data sources, templates, reports, deadlines, metrics, multipart template upload/update, and binary report download.
- **Matcher:** contexts, sources, field maps, discovery-over-Fetcher, matching, exceptions, disputes, governance, reporting, and system operations.
- **Tracer:** rules, limits, validations, audit events, and system operations.
- **Flowker:** catalog, workflow definitions, executions, configurations, observability, webhooks, and system operations.
- **Underwriter:** jurisdictions, loan products, loan applications, schedule preview, example endpoints, and system operations.

## Cross-Product Workflows

- **Fetcher -> Reporter:** validate extraction mappings with Fetcher, then create, inspect, or download Reporter reports.
- **Matcher -> Fetcher -> Midaz:** configure Matcher reconciliation, use Matcher discovery over Fetcher, inspect Fetcher jobs, and inspect Midaz ledger-side data.

## Diagram Maintenance Rules

1. Keep diagrams synchronized with `src/index.ts`, `src/runtime/surface-registry.js`, `src/products/index.js`, and `src/workflows/index.js`.
2. Do not document tools that are no longer registered at runtime.
3. For live API diagrams, show the required discovery-before-execution path.
4. For mutating calls, show `confirmMutation=true` and `mutationReason` as mandatory gates.
5. For security diagrams, show URL normalization, HTTPS enforcement outside localhost, protected header handling, and upload/download byte limits.
6. For workflow diagrams, show `sessionToken` as private state and avoid rendering token values in examples.

## Historical Note

Older media documentation described a Midaz-only proxy with 21 financial tools and stub/fallback backend behavior. That is no longer the current runtime shape. The server now exposes a portfolio-level MCP surface with a unified documentation tool, live product adapters, and guided cross-product workflows.
