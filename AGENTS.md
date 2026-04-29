# Repository Agent Instructions

This repository contains the Lerian MCP Server: a Node.js ESM package that exposes Lerian portfolio discovery, documentation, live product API adapters, and cross-product workflows through the Model Context Protocol.

## Runtime Facts

- Main source entrypoint: `src/index.ts`.
- NPX/package entrypoint: `src/bin/lerian-mcp-server.js`.
- Build output: `dist/`.
- Runtime transport: MCP stdio. Keep stdout clean for protocol messages.
- Minimum Node.js version: `>=20.19.0`.
- Primary package manager: npm with `package-lock.json`.

## Development Commands

- Install dependencies: `npm ci`.
- Build: `npm run build`.
- Typecheck: `npm run typecheck`.
- Lint: `npm run lint`.
- Test: `npm test`.
- Run development server: `npm run dev`.

## Implementation Rules

- Prefer small, direct changes over broad rewrites.
- Keep MCP stdio safe: do not add normal stdout logging during server startup or tool execution.
- Use stderr or the existing logging utilities for diagnostics.
- Preserve the discover-before-execute pattern for live product APIs.
- Mutating live API actions must continue to require `confirmMutation=true` and `mutationReason`.
- Do not weaken URL validation, protected header handling, upload/download byte limits, or output sanitization.
- Do not commit secrets, tokens, local config files, generated logs, or build artifacts unless explicitly requested.

## Architecture Pointers

- Core tool: `src/tools/lerian.js`.
- Cross-product workflow tool: `src/tools/portfolio-workflow.js`.
- Product adapter registry: `src/products/index.js`.
- Product metadata: `src/catalog/product-registry.js`.
- Runtime surface metadata: `src/runtime/surface-registry.js`.
- Live API safety helpers: `src/products/http-helpers.js`.
- Midaz API schemas: `src/api/schemas/`.
- Other product schemas: `src/products/*/schemas/`.
- Workflows: `src/workflows/`.
- Prompt registrations: `src/prompts/`.

## Documentation Rules

- Keep `README.md` aligned with the runtime, not historical package claims.
- Keep `docs/media/README.md` synchronized with registered tools, products, and workflows.
- If a doc says the server is documentation-only, verify against `src/index.ts` before preserving that statement.
