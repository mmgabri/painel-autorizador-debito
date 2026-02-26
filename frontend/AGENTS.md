# AGENTS.md — Regras para Agentes de IA (Angular 21 + Material)

Projeto: **Angular 21.1.5** (standalone), **RxJS 7.8**, **TypeScript 5.9**, **SCSS**, testes com **Vitest**, UI com **Angular Material**.  
Objetivo: entregar features pequenas, consistentes, testáveis e com UI padronizada.

---

## 1) Regras gerais
- Faça mudanças **pequenas** e **incrementais** (um objetivo por PR).
- Preserve o padrão existente do projeto.
- Evite dependências novas. Se precisar, justifique.
- Entregue código que **compila**, **testa** e **roda**.

---

## 2) Comandos obrigatórios (rode antes de finalizar)
- Instalar: `npm ci`
- Dev: `npm start`
- Build: `npm run build`
- Testes: `npm test`

Se algum falhar: corrigir ou explicar claramente no PR.

---

## 3) Padrão Angular 21 (standalone)
- Use **Standalone Components** por padrão (`standalone: true`).
- Evite `NgModule` (somente com justificativa forte).
- Providers globais em `src/app/app.config.ts`:
  - `provideRouter(routes, ...)`
  - `provideHttpClient(...)`
- Rotas em `src/app/app.routes.ts` e/ou `features/<feature>/routes.ts`.

---

## 4) Estrutura de pastas
- `src/app/core/`
  - serviços singleton (auth, storage, logging)
  - interceptors
  - guards
  - config global
- `src/app/shared/`
  - componentes reutilizáveis (UI)
  - pipes, directives, validators
- `src/app/features/<feature>/`
  - `pages/` (páginas/rotas)
  - `components/` (componentes internos)
  - `services/` (serviços da feature)
  - `models/` (types/interfaces)
  - `routes.ts` (rotas da feature, se necessário)

Regra: específico da feature fica dentro dela; transversal vai para core/shared.

---

## 5) Signals x RxJS (regra do projeto)
- **UI state**: prefira **Signals** (`signal`, `computed`, `effect`).
- **I/O e streams (HTTP, eventos, async)**: use **RxJS**.
- Evite `subscribe()` em componentes quando possível:
  - prefira `async` pipe no template
  - ou converta para Signals apenas quando necessário e de forma explícita
- Ao usar `subscribe()`, garanta cleanup (ex.: `takeUntilDestroyed()`).

---

## 6) Componentes
- Uma responsabilidade principal por componente.
- Prefira `ChangeDetectionStrategy.OnPush` em novos componentes.
- Evite lógica pesada no template; mova para o TS.
- Evite manipulação direta de DOM.

---

## 7) HTTP / APIs
- Use `HttpClient` via `provideHttpClient()` no `app.config.ts`.
- Centralize chamadas HTTP em services.
- Sempre tipar responses (ex.: `Observable<User[]>`).
- Trate erros com `catchError` e mensagens coerentes (não engolir erro).

---

## 8) Rotas
- Prefira lazy-loading com `loadComponent` para páginas.
- Guards/resolvers apenas se houver justificativa clara.
- Rotas devem ser previsíveis e simples.

---

## 9) UI — Angular Material (regras do projeto)
- Use Angular Material como **biblioteca padrão de componentes** (não reinventar botão, modal, toast, tabela).
- **Não** crie componentes “na unha” que já existam no Material (Dialog, Snackbar, Table, Form Field, etc.).
- Para formulários, use:
  - `mat-form-field` + `matInput`
  - validação com mensagens claras (`mat-error`)
- Para feedback do usuário:
  - `MatSnackBar` para mensagens rápidas
  - `MatDialog` para confirmação/edição
- Para listas/tabelas:
  - `MatTable` quando houver colunas
  - paginação/ordenação com `MatPaginator` / `MatSort` quando aplicável
- Tema:
  - Respeitar o tema configurado (não hardcode de cores fora do padrão).
  - Estilos custom devem ser mínimos e preferir tokens/classes do Material quando possível.

---

## 10) SCSS
- `src/styles.scss` é para estilos globais (reset, layout base, tema).
- Estilos específicos no `.scss` do componente.
- Evite CSS global que vaze sem necessidade.

---

## 11) Testes (Vitest)
- Testes pequenos e determinísticos.
- Para services HTTP: testar com mocks/Http testing utilities.
- Para componentes/páginas: render básico e interação principal.
- Toda feature nova relevante deve incluir ao menos:
  - 1 teste de service (se existir)
  - 1 teste de componente/página (se fizer sentido)

---

## 12) Regras de PR
Cada PR deve incluir:
- O que foi feito (bullets).
- Como testar (passos).
- Evidência que rodou:
  - `npm test`
  - `npm run build`

Se mudar rotas/contratos/configuração, documentar no README quando necessário.

---

## 13) O que NÃO fazer
- Não reestruture todo o projeto sem pedido explícito.
- Não adicionar state manager pesado (NgRx etc.) sem necessidade.
- Não mudar build/test/config sem explicar.
- Não alterar padrão visual fora do tema Material.

---

## 14) Checklist final
- [ ] `npm test` passou
- [ ] `npm run build` passou
- [ ] App sobe com `npm start`
- [ ] Tipagens ok (sem `any` gratuito)
- [ ] UI consistente com Angular Material