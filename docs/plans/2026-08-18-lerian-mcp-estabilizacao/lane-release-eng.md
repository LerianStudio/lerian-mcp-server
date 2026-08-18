# Lane release-eng — Implementation Plan

> **For implementers:** Use ring-default:executing-plans (rolling-phase: elaborate the
> current phase against the real code, execute its tasks in review-checkpointed
> batches, then elaborate the next phase — repeat),
> ring-default:dispatching-workflows to run each phase as a reviewed multi-agent
> workflow (review + contrarian baked in), or ring-dev-team:running-dev-cycle for the
> full subagent-orchestrated workflow.
> This document is the living source of truth — task elaboration for later
> phases is written back into it during execution.

**Goal:** existe exatamente UM caminho de publicação, e ele é fisicamente incapaz de publicar sem lint+build+testes verdes; README e regras de versionamento dizem a verdade.

**Architecture:** hoje três workflows publicam no npm de forma independente e sem rodar testes: `release.yml` (semantic-release, dispara em push na main), `dual-publish.yml` (publica os DOIS nomes de pacote, também em push na main — corrida de versão com o anterior) e `manual-publish.yml` (dispatch manual, sem testes). O `.releaserc.json` mapeia todo tipo de commit para `minor`. A consolidação: `release.yml` vira o único veículo, com job de qualidade (lint+build+test) como `needs:` do job de publish; o publish do nome legado `@lerianstudio/midaz-mcp-server` (já marcado deprecated) vira um step do mesmo pipeline; os outros dois workflows morrem.

**Tech Stack:** GitHub Actions, semantic-release, npm.

**Lane:** release-eng
**Depends on:** none
**Worktree:** `/srv/worktrees/mcp-release-eng` on branch `agent/mcp-release-eng`

Contratos congelados: FC-1 (nomes de config a documentar), FC-4 (veículo único de release, alvo 4.0.0), FC-5 (fronteira de arquivos) — ver `index.md`.

**Estado da base:** `npm test` vermelho na base por defeito pré-existente (lane midaz-adapter conserta). O gate de teste que esta lane instala vai, corretamente, bloquear release até aquela lane mergear — comportamento desejado. Verificação scoped (Task 1.2.2); merge após rebase pós-midaz-adapter e pós-sdk-v2, com CI completa verde.

## Phase Overview

| Phase | Milestone | Epics | Status |
|-------|-----------|-------|--------|
| 1 | Um único pipeline de release, gated; regras de versão sane; README fiel ao produto | 1.1, 1.2 | Detailed |

---

### Epic 1.1: Pipeline único e gated

**Goal:** publicar no npm só é possível via `release.yml`, e só com qualidade verde.
**Scope:** `.github/workflows/release.yml`, `.github/workflows/dual-publish.yml` (remoção), `.github/workflows/manual-publish.yml` (remoção), `.github/workflows/ci.yml`, `.github/workflows/feature-ci.yml`, `.releaserc.json`.
**Dependencies:** none
**Done when:** grep por `npm publish` nos workflows retorna apenas o(s) step(s) do pipeline único; o job de publish declara `needs:` do job de qualidade; nenhum workflow de publish dispara sem esse gate.
**Status:** Pending

#### Task 1.1.1: Gatear `release.yml` e absorver o dual-publish

- [x] Done

> **Achado durante a execução:** existia um QUARTO caminho de publish não previsto no plano —
> `package-manager.yml`, disparado por `release: published`. Como o semantic-release cria a
> release do GitHub com token de GitHub App (não `GITHUB_TOKEN`), esse workflow disparava a
> cada release e republicava no npm além de publicar no GitHub Packages (canal não
> documentado em nenhum lugar do repo). Está dentro da fronteira FC-5 (`.github/workflows/**`)
> e viola FC-4, então foi deletado junto com os outros dois — sem ele a Verification desta
> task (grep mostrando publish só em `release.yml`) é impossível de passar.

**Context:** `release.yml` roda checkout → Node 22 → `npm ci` → `npm run build:release` → GPG → semantic-release, SEM testes e SEM dependência do `ci.yml`. `dual-publish.yml` dispara em push na main de forma independente, publica `@lerianstudio/lerian-mcp-server` e depois reescreve o nome para `@lerianstudio/midaz-mcp-server` (deprecated) e publica de novo — dois workflows publicando a mesma main sem coordenação.

**Implementation vision:** reestruturar `release.yml` em dois jobs: `quality` (npm ci → `npm run ci:all`) e `publish` (`needs: quality`), mantendo semantic-release como motor. Mover o publish do nome legado para um step pós-semantic-release do MESMO job `publish` (reaproveitando a técnica de rename do dual-publish, apenas se decidirmos manter o espelho legado até a deprecação formal da wave 2 — manter por ora, remoção é decisão da wave 2 junto com o `npm deprecate`). Deletar `dual-publish.yml` e `manual-publish.yml`. Nota para a wave 2 no PR: o slot para o teste de boot do artefato empacotado é um step no job `quality` (a wave 2 o adiciona).

**Files:**
- Modify: `.github/workflows/release.yml`
- Delete: `.github/workflows/dual-publish.yml`, `.github/workflows/manual-publish.yml`

**Verification:** `grep -rn "npm publish\|semantic-release" .github/workflows/` mostra publicação apenas em `release.yml`; parse YAML de todos os workflows (`node -e` com um parser YAML já disponível via `npx yaml`) exit 0.

**Done when:** um caminho de publish, gated por `needs: quality`.

#### Task 1.1.2: Regras de versionamento e matrix de Node

- [x] Done

> **Decisões tomadas na execução:**
> - `engines` continua `>=20.19.0`: a lane `sdk-v2` ainda não tem PR aberto, então não há floor
>   novo para alinhar. Matrix ficou `['20.19', '22']` (as duas pontas do range suportado). Se a
>   SDK v2 subir o floor, quem fecha aquela lane ajusta o matrix junto.
> - `dependency-review` do `feature-ci.yml` NÃO foi migrado para o `ci.yml`: o `code-quality.yml`
>   já roda um job idêntico (mesma action, mesmo `fail-on-severity: moderate`, mesmo trigger de
>   PR). Migrar duplicaria o check. O que era exclusivo do `feature-ci.yml` — o `npm audit
>   --audit-level moderate` bloqueante em PR, e os triggers de push `refactor/**` e `docs/**` —
>   foi absorvido pelo `ci.yml`.
> - O step "check for uncommitted changes" do `feature-ci.yml` foi descartado: `dist/` é
>   gitignored e `npm run build` só escreve lá, então o check nunca poderia falhar.
> - Uma linha do `release.yml` (fora da lista de Files desta task, dentro do Scope do Epic 1.1 e
>   da fronteira FC-5): o trigger de push em `develop` foi removido, porque tirar `develop` do
>   `.releaserc.json` o deixou morto — o workflow anunciava um canal de prerelease que deixou de
>   existir.

**Context:** `.releaserc.json:14-27` mapeia `feat, fix, perf, docs, chore, refactor, test, build, ci` e o catch-all `*` todos para `minor` — não existe patch no fluxo automatizado. Branches: `main` (release) + `develop` (prerelease); `develop` está divergido/obsoleto e será reconciliado na wave 2. CI roda só Node 22.x, mas `engines` declara `>=20.19.0`.

**Implementation vision:** regras convencionais: `feat` → minor, `fix`/`perf` → patch, `docs`/`chore`/`refactor`/`test`/`build`/`ci` → sem release, `BREAKING CHANGE` → major (o release 4.0.0 de FC-4 virá do commit breaking da FC-1). Remover `develop` do `.releaserc.json` (pós-reconciliação ele deixa de ser canal de prerelease; se voltar a ser, é decisão futura). Matrix de Node no `ci.yml`: `[20.19, 22]` — alinhar ao `engines` final que a lane sdk-v2 anotar no PR dela (se a SDK v2 subir o floor, usar o floor novo; conferir a descrição do PR daquela lane antes de fechar esta task). Dedupe: `feature-ci.yml` sobrepõe o `ci.yml` em triggers — fundir o que for único (audit + dependency-review em PRs) dentro do `ci.yml` e deletar `feature-ci.yml`.

**Files:**
- Modify: `.releaserc.json`, `.github/workflows/ci.yml`
- Delete: `.github/workflows/feature-ci.yml`

**Verification:** parse YAML/JSON verde; `npx semantic-release --dry-run` local com `--no-ci` para validar que o `.releaserc.json` carrega sem erro de config (sem publicar).

**Done when:** regras patch/minor/major corretas, matrix alinhado, um só workflow de CI.

---

### Epic 1.2: README e verificação scoped

**Goal:** README descreve o pacote que existirá no 4.0.0 — sem versão fóssil, sem env vars mortos.
**Scope:** `README.md`.
**Dependencies:** Epic 1.1
**Done when:** README sem menção à topologia legada; instalação e configuração conferem com FC-1.
**Status:** Pending

#### Task 1.2.1: Reescrever as seções de instalação e configuração do README

- [ ] Done

**Context:** o README anuncia "current package version 3.4.0" (`README.md:340-346`) com o pacote em 3.7.0, e documenta a configuração Midaz multi-serviço legada.

**Implementation vision:** remover claims de versão hardcoded (apontar para a página npm/releases em vez de fixar número). Seção de configuração Midaz reescrita com exatamente os três env vars de FC-1 e uma linha explicando o ledger unificado. Revisar a tabela de tools contra FC-2 (16 nomes). Não documentar transportes que não existem (stdio é o único). Nota de breaking change 4.0.0 (env vars renomeados) num bloco curto de migração.

**Files:**
- Modify: `README.md`

**Verification:** grep no README por `MIDAZ_ONBOARDING_URL|MIDAZ_TRANSACTION_URL|MIDAZ_CRM_URL|MIDAZ_LEDGER_URL|3\.4\.0` vazio.

**Done when:** README fiel a FC-1/FC-2.

#### Task 1.2.2: Verificação scoped da lane

- [ ] Done

**Context:** workflows só provam comportamento rodando; parte da prova real fica para o PR (CI dispara nos triggers novos) e para a wave 2 (release de verdade).

**Implementation vision:** validar localmente parse de todos os YAML/JSON tocados; abrir o PR e confirmar que o `ci.yml` novo dispara e roda lint+build (teste ficará vermelho até o rebase — documentado); registrar no PR o checklist: rebase pós-merge de midaz-adapter e sdk-v2 → `npm run ci:all` verde → merge. O primeiro release real (4.0.0) é execução da wave 2, não desta lane.

**Files:**
- (nenhum novo — verificação)

**Verification:** parse verde local; CI do PR executa os jobs novos.

**Done when:** pipeline validado até onde é possível sem publicar; checklist de merge no PR.
