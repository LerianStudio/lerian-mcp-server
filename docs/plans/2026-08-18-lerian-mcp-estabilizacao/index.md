# Lerian MCP Estabilização — Lane Plan Index

> **For implementers:** this index is not executable. Every lane below has its own
> plan document, run from its own worktree by ring-default:executing-plans,
> ring-default:dispatching-workflows, or ring-dev-team:running-dev-cycle. One lane per session.
> Read `## Frozen Contracts` before writing any code — a lane MUST NOT change one.

**Goal:** `@lerianstudio/lerian-mcp-server@latest` volta a inicializar, com o produto Midaz migrado para o padrão de adapters contra o ledger unificado, a SDK MCP migrada para a v2 (spec 2026-07-28), e o release passa a ser um pipeline único travado em CI verde — publicação única (4.0.0) com os 7 produtos.

**Architecture:** o servidor é um MCP stdio em Node, com um adapter por produto (`src/products/<produto>/{index,client,router,schemas}`) sobre helpers compartilhados (`src/products/http-helpers.js`, `schema-registry.js`) e um wrapper único de registro de tools (`src/util/mcp-registration.js`) que isola a SDK. O Midaz hoje vive numa implementação legada paralela (`src/api/*`) apontando para a topologia antiga de 4 serviços (portas 3000–3003); o Midaz real é um serviço unificado numa porta (default `:3002`) com spec OpenAPI canônica commitada (`components/ledger/api/openapi.huma.yaml`, v2 vivo, v1 deprecado). A SDK atual (`@modelcontextprotocol/sdk` ^1.29) foi aposentada upstream: a v2 (2026-07-28) reparte em `@modelcontextprotocol/server`/`client` + adapters. O release hoje tem três workflows de publish independentes e nenhum roda testes antes do `npm publish`.

**Tech Stack:** Node >=20.19.0 (ESM), TypeScript (entry `src/index.ts`, resto JS), `node:test`, zod, semantic-release, GitHub Actions, `@modelcontextprotocol/server` 2.0.0 (alvo).

**Base branch:** `main` (fonte da verdade; `develop` está divergido em v2.35.0 e será reconciliado na lane de integração). Todas as lanes ramificam de `origin/main`.

**Decisões de produto que governam este plano (Fred, 18-08-2026):** um release só, com Midaz dentro; adaptador contra o ledger unificado (nada da topologia legada); SDK MCP na v2; nunca mais publicar sem CI verde; página de docs só volta após smoke test do artefato publicado.

## Lane Overview

| Lane | Delivers | Depends on | Wave | Worktree / Branch | Plan | Status |
|------|----------|-----------|------|-------------------|------|--------|
| midaz-adapter | Servidor sobe com os 7 produtos; Midaz no padrão de adapters contra o ledger unificado (v2); legado `src/api/` removido | none | 1 | `/srv/worktrees/mcp-midaz-adapter` / `agent/mcp-midaz-adapter` | lane-midaz-adapter.md | Pending |
| sdk-v2 | Servidor rodando sobre `@modelcontextprotocol/server` 2.0.0; wrapper `registerMcpTool` com assinatura preservada; pacote monolítico removido | none | 1 | `/srv/worktrees/mcp-sdk-v2` / `agent/mcp-sdk-v2` | lane-sdk-v2.md | Pending |
| release-eng | Pipeline de release único e gated em testes; workflows redundantes removidos; README e regras de versão corrigidos | none | 1 | `/srv/worktrees/mcp-release-eng` / `agent/mcp-release-eng` | lane-release-eng.md | Pending |
| integration-release | Teste de boot do artefato empacotado no CI; release 4.0.0 publicado e smoke-testado; deprecação do pacote legado; develop reconciliado | midaz-adapter, sdk-v2, release-eng | 2 | `/srv/worktrees/mcp-integration-release` / `agent/mcp-integration-release` | (deferred — authored when wave 1 merges) | Pending |

`Status` lifecycle: Pending → In flight → In review → Merged | Failed.
The orchestrator session owns this column. Lanes never write to this file.

Nota de ambiente: nesta máquina (mordor) os worktrees são criados com `agent new lerian-mcp-server <slug>`, que produz `/srv/worktrees/<slug>` na branch `agent/<slug>` — equivalente local de ring-default:creating-worktrees, substituindo o default `../<repo>-worktrees/`.

## Waves

- **Wave 1** — `midaz-adapter`, `sdk-v2` e `release-eng`, lançadas juntas, worktrees e executores independentes.
- **Wave 2** — `integration-release`, desbloqueada quando as três lanes da wave 1 lerem Merged. Seu plano é autorado nesse momento, contra o código realmente mergeado.

**Estado da base (afeta a verificação das lanes):** `main` hoje NÃO passa `npm test` — `test/runtime-surface-registry.test.js` falha em import (`src/products/midaz/index.js` inexistente). Somente `midaz-adapter` fica 100% verde standalone; `sdk-v2` e `release-eng` verificam com comandos scoped ao próprio escopo e só abrem/finalizam PR após rebase pós-merge de `midaz-adapter` (ver Merge Order). Isso é uma exceção documentada à regra "lane verde standalone", causada por defeito pré-existente da base que exatamente uma lane conserta.

## Frozen Contracts

Escritos antes de qualquer lane começar. Nenhuma lane os altera; se uma precisar, ela PARA e o orquestrador re-corta.

### FC-1 — Contrato de configuração do Midaz (novo)

`midaz-adapter` implementa em `src/config.js`; `release-eng` documenta no README exatamente estes nomes; `integration-release` verifica a ausência dos legados.

```js
// config.midazApi — substitui integralmente o bloco legado
{
  baseUrl:   process.env.MIDAZ_BASE_URL   ?? 'http://localhost:3002', // ledger unificado
  authToken: process.env.MIDAZ_AUTH_TOKEN ?? null,
  timeout:   Number(process.env.MIDAZ_API_TIMEOUT ?? 30000)
}
// REMOVIDOS (não documentar, não ler, não aceitar):
// MIDAZ_ONBOARDING_URL, MIDAZ_TRANSACTION_URL, MIDAZ_CRM_URL, MIDAZ_LEDGER_URL
```

### FC-2 — Superfície de tools do release (critério de aceite da wave 2)

A lista ordenada exata de tools que o servidor registra (já assertada por `test/runtime-surface-registry.test.js`):

```
fetcher-discover, fetcher-execute, flowker-discover, flowker-execute, lerian,
matcher-discover, matcher-execute, midaz-discover, midaz-execute,
portfolio-workflow, reporter-discover, reporter-execute, tracer-discover,
tracer-execute, underwriter-discover, underwriter-execute
```

### FC-3 — Assinatura do wrapper de registro (a costura entre midaz-adapter e sdk-v2)

`src/util/mcp-registration.js` exporta `registerMcpTool` e `TOOL_ANNOTATIONS`. A lane `sdk-v2` é a ÚNICA dona deste arquivo e reimplementa seus internals contra a SDK v2, MAS a assinatura pública e a semântica observável pelos chamadores ficam byte-idênticas: mesmos parâmetros, mesmos nomes de annotations (`READ_ONLY`, `LIVE_API`, ...), mesmo contrato de handler (input validado por schema zod; retorno no shape de content atual). Todo arquivo em `src/tools/*.js` continua compilando e passando testes sem edição. Se a v2 tornar isso impossível, a lane PARA e reporta — não vaza mudança para os chamadores.

### FC-4 — Versão e veículo do release

Alvo `4.0.0` (major: contrato de configuração FC-1 quebra env vars publicados; SDK major). Publicado exclusivamente pelo pipeline consolidado da lane `release-eng` (semantic-release na `main`, gated em `npm run ci:all` verde + teste de boot do artefato na wave 2). Nenhum publish manual, nenhum publish fora desse caminho. A versão final é computada pelo semantic-release a partir dos conventional commits (commit com `BREAKING CHANGE` garantido pela FC-1).

### FC-5 — Fronteira de arquivos da wave 1

`midaz-adapter`: `src/products/midaz/**` (novo), `src/tools/midaz-*.js`, `src/api/**` (remoção), `src/workflows/matcher-fetcher-midaz.js`, `src/config.js`, `.env.example`, `src/bin/midaz-mcp-server.js` (remoção), `test/product-routing-config.test.js`.
`sdk-v2`: `package.json`, `package-lock.json`, `src/index.ts`, `src/util/mcp-registration.js`, `src/types/**`, `tsconfig.json` (se necessário), testes próprios novos.
`release-eng`: `.github/workflows/**`, `.releaserc.json`, `README.md`.
Interseção vazia por construção. Um arquivo fora da própria lista = parar e re-cortar.

## Integration Lane

`integration-release` (wave 2) — obrigatória: as três lanes da wave 1 tocam o mesmo subsistema (o pacote publicável). Carrega o E2E entre lanes e todas as verificações de ausência (regra 4):

### Lane: integration-release

**Goal:** 4.0.0 publicado, funcional e verificado; repositório sem restos do mundo legado.
**Scope:** teste de boot do artefato (`npm pack` → instalar → subir → assertar FC-2) wired no CI como gate de release; verificação de ausência (`src/api/` inexistente; nenhuma referência aos env vars legados de FC-1; nenhuma importação de `@modelcontextprotocol/sdk` remanescente; nenhum workflow de publish fora do pipeline de FC-4); reconciliação de `develop` com `main` (ação destrutiva — confirmar com Fred antes do force-push); execução do release 4.0.0; `npm deprecate` do pacote legado `@lerianstudio/midaz-mcp-server` com mensagem apontando o novo; smoke test do artefato publicado (`npx @lerianstudio/lerian-mcp-server@latest` sobe e anuncia FC-2).
**Depends on:** midaz-adapter, sdk-v2, release-eng (todas Merged).
**Done when:** `npx @lerianstudio/lerian-mcp-server@latest` inicializa em ambiente limpo com a superfície FC-2; pacote legado deprecado; `develop` reconciliado.

## Merge Order

1. `midaz-adapter` merge primeiro — é a única lane verde standalone (a base tem teste quebrado que só ela conserta).
2. `sdk-v2` rebasa na `main` atualizada, roda a suíte completa verde, abre/atualiza PR, merge.
3. `release-eng` rebasa, CI completa verde, merge.
4. `integration-release` (wave 2) ramifica da `main` final.

Depois de cada merge, toda lane ainda aberta rebasa na nova base antes de continuar. Desenvolvimento das três lanes é concorrente; apenas merge é ordenado.

## Fora de escopo deste plano

Fases cloud (control plane, ações não-monetárias no SaaS): plano próprio, gated pelo discovery de demanda. Relançamento da página de docs: repositório `documentation`, após o smoke test da wave 2. Capacidades novas da SDK v2 além da paridade (Streamable HTTP remoto etc.): fase cloud.
