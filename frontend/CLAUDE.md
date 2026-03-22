# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm ci          # Install dependencies (use this, not npm install)
npm start       # Dev server at http://localhost:4200
npm run build   # Production build → dist/
npm test        # Run tests with Vitest
npm run watch   # Dev build in watch mode
```

Run a single test file: `npx vitest run src/app/features/my-feature/my.spec.ts`

Before finishing any change: verify `npm test` and `npm run build` both pass.

## Architecture

**Stack:** Angular 21 (standalone), Angular Material 21, RxJS 7.8, TypeScript 5.9, SCSS, Vitest.

**Two backend APIs** configured in `src/app/environments/environment.ts`:
- `apiBaseUrl` → Node.js/Express at `http://localhost:3000` (consulta, dashboard)
- `apiBaseUrlJava` → Java/Spring at `http://localhost:8080` (simulador ISO 8583)

**Folder conventions:**
```
src/app/
├── core/          # Singleton services, interceptors, guards (shared app-wide)
├── shared/        # Reusable components, pipes, directives, validators
├── features/      # Feature slices — each has pages/, components/, services/, models/, routes.ts
│   ├── simulador-autorizador-debito/   # ISO 8583 message simulator (Java backend)
│   ├── consulta-transacoes/            # Transaction query (Node backend)
│   └── dashboard-debito/               # Metrics dashboard (Node backend)
└── core/layout/shell/                  # App shell with Material sidenav navigation
```

Feature-specific code stays inside the feature folder. Cross-cutting concerns go in `core/` or `shared/`.

## Key Patterns

**Standalone components only** — no `NgModule`. Global providers live in `app.config.ts`.

**State: Signals for UI, RxJS for I/O:**
- Local/derived state → `signal()`, `computed()`
- HTTP and async streams → RxJS `Observable`
- Avoid `subscribe()` in components when possible; prefer `async` pipe or `toSignal()`
- When using `subscribe()`, always cleanup with `takeUntilDestroyed()`

**Components:**
- `ChangeDetectionStrategy.OnPush` on all new components
- One responsibility per component; keep logic in the `.ts`, not the template

**HTTP services:**
- All HTTP calls centralized in `services/` within each feature
- Always type responses: `Observable<MyType>`
- Handle errors with `catchError` + `MatSnackBar` for user feedback (never silently swallow errors)

**Routing:** lazy-loaded via `loadComponent` for pages; `loadChildren` for feature route groups.

**UI:** Angular Material is the only UI library. Do not recreate what Material already provides (Dialog, Snackbar, Table, FormField, etc.). Use `MatSnackBar` for quick messages, `MatDialog` for confirmations/edits.

**SCSS:** Global styles only in `src/styles.scss`. Component styles in their own `.scss` file. Avoid leaking global CSS.

**Tests (Vitest):** Services with HTTP → use Angular `HttpTestingController`. Components → basic render + main interaction. Every new feature needs at least one service test and one component test.

## What NOT to Do

- Do not add `NgModule`
- Do not introduce a global state manager (NgRx, Akita, etc.)
- Do not create custom UI components that Angular Material already provides
- Do not hardcode colors outside the Material theme
- Do not restructure the project without explicit request
- Avoid `any` types
