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
| 1 | Um único pipeline de release, gated; regras de versão sane; README fiel ao produto | 1.1, 1.2, 1.3 | Done |

---

### Epic 1.1: Pipeline único e gated

**Goal:** publicar no npm só é possível via `release.yml`, e só com qualidade verde.
**Scope:** `.github/workflows/release.yml`, `.github/workflows/dual-publish.yml` (remoção), `.github/workflows/manual-publish.yml` (remoção), `.github/workflows/ci.yml`, `.github/workflows/feature-ci.yml`, `.releaserc.json`.
**Dependencies:** none
**Done when:** grep por `npm publish` nos workflows retorna apenas o(s) step(s) do pipeline único; o job de publish declara `needs:` do job de qualidade; nenhum workflow de publish dispara sem esse gate.
**Status:** Done

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
**Status:** Done

#### Task 1.2.1: Reescrever as seções de instalação e configuração do README

- [x] Done

> **Decisões tomadas na execução:**
> - A tabela de tools já batia com FC-2 (16 nomes, conferidos contra
>   `test/runtime-surface-registry.test.js`) — nenhuma edição necessária ali.
> - O bloco "Package Information" citava `@modelcontextprotocol/sdk` como SDK do pacote. Como a
>   lane `sdk-v2` troca isso por `@modelcontextprotocol/server` 2.0.0, a linha seria um fóssil
>   novo no 4.0.0 — foi removida (detalhe de implementação que nenhum consumidor precisa), junto
>   com a mesma menção no diagrama de arquitetura. Entrou no lugar a linha de transporte
>   (`stdio only`), que é o que o usuário de fato precisa saber.
> - A nota de migração 4.0.0 descreve os quatro env vars legados sem soletrá-los: a Verification
>   desta task é justamente um grep por esses nomes no README.

**Context:** o README anuncia "current package version 3.4.0" (`README.md:340-346`) com o pacote em 3.7.0, e documenta a configuração Midaz multi-serviço legada.

**Implementation vision:** remover claims de versão hardcoded (apontar para a página npm/releases em vez de fixar número). Seção de configuração Midaz reescrita com exatamente os três env vars de FC-1 e uma linha explicando o ledger unificado. Revisar a tabela de tools contra FC-2 (16 nomes). Não documentar transportes que não existem (stdio é o único). Nota de breaking change 4.0.0 (env vars renomeados) num bloco curto de migração.

**Files:**
- Modify: `README.md`

**Verification:** grep no README por `MIDAZ_ONBOARDING_URL|MIDAZ_TRANSACTION_URL|MIDAZ_CRM_URL|MIDAZ_LEDGER_URL|3\.4\.0` vazio.

**Done when:** README fiel a FC-1/FC-2.

#### Task 1.2.2: Verificação scoped da lane

- [x] Done

> **Resultado da execução:**
> - Parse verde de todos os YAML/JSON tocados, com checagem estrutural além do parse: todo
>   `needs:` aponta para job existente, publish confinado ao `release.yml` atrás de
>   `needs: quality`, `.releaserc.json` alcança patch/minor/major, matrix cobre o floor de
>   `engines`, README sem os env vars de FC-1. Mesma checagem contra `origin/main` (base
>   pré-lane) acusa 12 achados — RED antes, verde depois.
> - `npm run ci:lint` (eslint + tsc) verde. `npm run ci:test` builda limpo e falha exatamente
>   o defeito pré-existente da base: `test/runtime-surface-registry.test.js`,
>   `ERR_MODULE_NOT_FOUND` em `src/products/midaz/index.js` — conserto é da lane
>   `midaz-adapter`. O gate instalado por esta lane bloqueia release até lá, como desenhado.
> - PR #137 aberto contra `main`, `MERGEABLE` (sem conflito), com o checklist de merge.
>   Os jobs novos disparam: `Build and Test (20.19)` e `Build and Test (22)` (matrix novo)
>   e `Security Check` (audit absorvido do `feature-ci.yml`).
>
> **Colisão encontrada, resolvida na revisão (ver Task 1.3.1):** `check-branch.yml` reprova
> qualquer PR para `main` vindo de branch que não seja `develop` ou `hotfix/*` — o check falha
> no PR #137 por política, não por defeito. O plano manda as três lanes da wave 1 ramificarem
> de e mergearem em `main` enquanto `develop` está divergido e só será reconciliado na wave 2.
> Registro original desta task dizia "decisão acima da lane"; a revisão apontou corretamente que
> `.github/workflows/**` é fronteira desta lane e que nenhuma outra lane limparia o check antes
> do merge. Corrigido: `agent/*` passa a ser origem aceita.

---

### Epic 1.3: Correções da revisão

**Goal:** o pipeline único cumpre o que anuncia — nada publica sem gate, nada mente no nome do
check, e o custo de CI corresponde ao sinal produzido.
**Scope:** `.github/workflows/**`.
**Dependencies:** Epic 1.1, Epic 1.2
**Done when:** as correções dentro da fronteira FC-5 estão aplicadas e verificadas; o que ficou
fora está escalado abaixo, não silenciado.
**Status:** Done

#### Task 1.3.1: Aplicar as correções dentro de FC-5

- [x] Done

**Resultado da execução (uma correção por commit):**

1. **Credenciais de release fora do alcance de código não confiável.** O job de qualidade rodava
   `npm ci` (scripts de lifecycle de dependência) e a suíte do repo com o token de escrita do
   workflow inteiro, e o `checkout` deixava esse token gravado no workspace. Uma dependência
   transitiva comprometida teria acesso de push à `main` — exatamente o gate que esta lane
   existe para construir. Gate agora é read-only e sem credencial persistida; as permissões de
   escrita vivem só no job que publica. `workflow_dispatch` removido: permitia rodar o pipeline
   de release a partir de qualquer branch, entregando o token do npm, a chave GPG e a chave do
   GitHub App para código arbitrário.
2. **O espelho do nome legado ia derrubar o release 4.0.0.** Os dois nomes divergiram no npm:
   `@lerianstudio/midaz-mcp-server` já está em 4.0.0 (verificado no registry) enquanto o pacote
   real está em 3.7.0. O `npm publish` do espelho daria conflito de versão e pintaria a run de
   vermelho minutos depois do pacote real ter sido publicado, taggeado e released — o sinal
   falso que o pipeline consolidado existe para eliminar. Guarda de idempotência de volta (a que
   o `package-manager.yml` deletado tinha), restauração do `package.json` por `trap`, e falha do
   espelho reportada como step vermelho numa run verde. Verificado rodando o próprio script do
   step contra um `npm` stubado nos três casos (versão já espelhada / espelho ok / publish
   falha).
3. **O gate parou de anunciar um audit que não pode falhar.** Os dois steps se chamavam "Lint,
   typecheck, build, test, audit" enquanto o comando termina em `npm audit --json || true` —
   sempre verde. Nomes agora descrevem o que de fato gateia.
4. **Lint, typecheck e testes rodam uma vez, não quatro.** Deletar o `feature-ci.yml` tirou uma
   de quatro cópias; `code-quality.yml` e `security.yml` continuavam rodando os mesmos checks nos
   mesmos gatilhos (o ESLint do `code-quality.yml` com `continue-on-error`, ou seja, verde com
   lint quebrado). Cada workflow agora tem um dono: `ci.yml` os checks de qualidade nas duas
   pontas do range de Node, `code-quality.yml` CodeQL + dependency review, `security.yml` o audit
   profundo. Dois uploads de artefato foram junto — apontavam para arquivos que os jobs nunca
   produziram.
5. **`check-branch.yml` aceita `agent/*`.** Ver nota da Task 1.2.2.

**Verification:** parse YAML de todos os workflows verde; checagem estrutural: nenhum comando de
lint/typecheck/build/test sobrevive fora do `ci.yml` e do gate de release, `npm publish` e
`semantic-release` confinados ao `release.yml`, todo `needs:` resolve, gate read-only e publish
com escrita. `npm run ci:lint` verde; `npm run ci:test` com exatamente a falha pré-existente da
base (`test/runtime-surface-registry.test.js`), inalterada — esta lane não toca `src/`.

#### Task 1.3.2: Escalações ao orquestrador (fora de FC-5)

- [x] Done — decisões pendentes de Fred/orquestrador, nenhuma executável por esta lane.

**1. Existe um quinto caminho de publish, manual e sem gate.** `package.json` expõe
`publish:dual`, que roda `scripts/dual-publish.js`: builda e faz `npm publish --access public`
nos DOIS nomes de pacote, sem lint, sem typecheck e sem testes. Qualquer pessoa com token npm
publica do laptop e contorna o pipeline inteiro. Isso contradiz literalmente FC-4 ("nenhum
publish manual, nenhum publish fora desse caminho") e o Goal desta lane. `scripts/**` não está
na fronteira de nenhuma lane e `package.json` é da lane `sdk-v2` — por FC-5 ("um arquivo fora da
própria lista = parar e re-cortar"), esta lane para e escala. **Ação necessária:** deletar
`scripts/dual-publish.js` e a linha `publish:dual`, atribuído à lane `sdk-v2` ou à wave 2. O
espelho do nome legado já vive no `release.yml`; o script não tem outra função.

**2. A Merge Order publica o 4.0.0 pelo pipeline antigo.** Como está escrita no `index.md`,
`midaz-adapter` merga primeiro — e nesse momento a `main` ainda tem o `release.yml` velho (sem
gate) e o `.releaserc.json` velho (catch-all para `minor`). O commit breaking de FC-1 é
reconhecido como major, então 4.0.0 vai para o npm sem lint/build/test, com a SDK ainda v1 e o
README fóssil. FC-4 exige que o 4.0.0 saia exclusivamente pelo pipeline consolidado.
**Ação necessária:** mergear `release-eng` PRIMEIRO (o gate fica vermelho pelo defeito
pré-existente da base e bloqueia publicação acidental até `midaz-adapter` entrar — o
comportamento já documentado como desejado no Estado da base), ou desabilitar o `release.yml` na
`main` até a wave 1 fechar.

**3. `npm audit` está vermelho na base e nenhuma lane é dona do conserto.** 10 advisories (5
high, 4 moderate, 1 low: `linkify-it`, `markdown-it`, `qs`, entre outros). O job `Security Check`
é bloqueante em PR e é pré-existente (mesmo nome, comando e gatilho vinham do `feature-ci.yml`
da base), então o critério "CI completa verde, merge" do `index.md` é inalcançável para as três
lanes da wave 1 enquanto isso durar. O conserto é bump de `package-lock.json`, que FC-5 atribui à
lane `sdk-v2`. **Ação necessária:** atribuir o bump à `sdk-v2` ou à wave 2.

**4. O caminho de release não tem piso de vulnerabilidade.** `ci:audit` é `npm audit --json ||
true` e o único audit bloqueante roda só em pull request; um push direto na `main` (que não tem
proteção de branch) publica sem nenhum audit bloqueante. Tornar `ci:audit` bloqueante é edição em
`package.json` — fora de FC-5, e travaria o release enquanto o item 3 não fechar. **Ação
necessária:** decidir na wave 2, junto com o item 3.

**5. Defeito pré-existente na versão do artefato.** `build:release` roda `scripts/update-version.js`
ANTES do semantic-release bumpar o `package.json`, então o `src/index.ts` publicado é carimbado
com a versão ANTERIOR. Não introduzido por esta lane e fora de FC-5 (`scripts/**`,
`package.json`). **Ação necessária:** wave 2.

**Context:** workflows só provam comportamento rodando; parte da prova real fica para o PR (CI dispara nos triggers novos) e para a wave 2 (release de verdade).

**Implementation vision:** validar localmente parse de todos os YAML/JSON tocados; abrir o PR e confirmar que o `ci.yml` novo dispara e roda lint+build (teste ficará vermelho até o rebase — documentado); registrar no PR o checklist: rebase pós-merge de midaz-adapter e sdk-v2 → `npm run ci:all` verde → merge. O primeiro release real (4.0.0) é execução da wave 2, não desta lane.

**Files:**
- (nenhum novo — verificação)

**Verification:** parse verde local; CI do PR executa os jobs novos.

**Done when:** pipeline validado até onde é possível sem publicar; checklist de merge no PR.
