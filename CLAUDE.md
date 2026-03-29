# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Platform for simulating debit card transactions via **ISO 8583 protocol**, supporting **Mastercard** and **Visa**. Allows sending authorization, reversal, and reconciliation messages.

## Commands

### Frontend (Angular 21)
```bash
cd frontend
npm ci                  # Install dependencies (use this, not npm install)
npm start               # Dev server at http://localhost:4200
npm run build           # Production build → dist/painel-autorizador-debito/browser
npm test                # Run all tests with Vitest
npx vitest run src/app/features/my-feature/my.spec.ts  # Run single test file
npm run watch           # Dev build in watch mode
```

Before finishing any change: verify `npm test` and `npm run build` both pass.

### Backend (Spring Boot Java)
```bash
cd backend/debit-authorizer-simulator
mvn clean package -DskipTests   # Build JAR
```
Run as a Spring Boot application in your IDE. Backend available at `http://localhost:8081`.

### Backend Mock (Node.js)
```bash
cd backend/backend-mock
npm ci
npm run dev    # Hot reload dev server at http://localhost:3000
```

### Full Stack with Docker
```bash
docker-compose up   # Builds and starts frontend (4200) + Java backend (8081)
```
Set `SPRING_PROFILES_ACTIVE=dev` (debug logging) or `hom` (info logging) in `docker-compose.yml`.

## Architecture

Three services communicate as follows:

```
Angular Frontend (4200)
  ├── apiBaseUrl       → Node.js/Express mock (3000)  [consulta-transacoes, dashboard-debito]
  └── apiBaseUrlJava   → Spring Boot Java (8081)       [simulador-autorizador-debito, massa-testes, ISO 8583]
```

Both URLs are configured in `frontend/src/app/environments/environment.ts`.

### Frontend Structure (Angular 21 Standalone)
```
src/app/
├── core/          # Singleton services, interceptors, guards
├── shared/        # Reusable components, pipes, directives, validators
└── features/
    ├── simulador-autorizador-debito/  # ISO 8583 simulator → Java backend
    ├── massa-testes/                  # Test data (card/account) management → Java backend
    ├── consulta-transacoes/           # Transaction history → Node backend
    └── dashboard-debito/              # Metrics dashboard → Node backend
```
Each feature has `pages/`, `components/`, `services/`, `models/`, `routes.ts`. Feature-specific code stays inside the feature folder; cross-cutting concerns go in `core/` or `shared/`.

### Java Backend Structure (Spring Boot)
Layered architecture:
- **Adapters**: REST controllers, CSV parsers, ISO 8583 message builders/parsers (JPOS 2.1.9), Keyspaces (Cassandra)
- **Services**: Business logic for message dispatching, test scenario management, and test data management
- **Domains**: Entity models and enums

Key technical choices:
- **Apache Camel 4.8.4** with `@CsvRecord`/`@DataField` (Bindy) for positional CSV parsing of ISO 8583 message types (T464 for Mastercard, TCR for Visa)
- **Virtual Threads** enabled via `spring.threads.virtual.enabled: true` (Java 25)
- **Cassandra (AWS Keyspaces)** is optional — toggled by `app.keyspaces.enabled` in `application.yml`. When disabled, a NoOp adapter is used so the app runs without any Cassandra connection.
- `dev` profile connects to a **local Cassandra** (localhost:9042, no SSL/SigV4); `hom` profile connects to **AWS Keyspaces** (SSL + SigV4 via `ssl-enabled: true`).
- To run a local Cassandra for dev: `docker compose -f infra/docker/docker-compose-keyspaces-local.yml up`

### Backend Mock Structure (Node.js/Express)
Routes prefixed with `/api`: `iso8583`, `transacao`, `consulta`, `dashboard`. Test data stored in-memory using `Map<string, Transacao>`. CORS restricted to `http://localhost:4200`.

### Data Persistence
Three CSV files are used for persistence, all at the repo root and Docker-volume-mounted into the Java container at `/app/data/`:

| File | Purpose |
|------|---------|
| `cenarios_testes.csv` | ISO 8583 test scenarios (main simulator) |
| `massa_testes.csv` | Card/account test data for massa-testes feature |
| `dispatcher_events.csv` | Dispatcher event definitions |

**cenarios_testes.csv fields:** `id`, `product_name`, `message_model` (SINGLE_MESSAGE/DUAL_MESSAGE), `message_type` (AUTORIZACAO/CONCILIACAO), `payment_network` (MASTERCARD/VISA), `tag`, `description`, `message` (ISO 8583 hex), `updated_at`.

**massa_testes.csv fields:** `id`, `payment_network`, `message_model`, `tag`, `description`, `card_number`, `expiry_date`, `card_functionality_code`, `first_digit_service_code`, `situation_code`, `status_code`, `technology_code`, `type_code`, `account_id`, `agency`, `account`, `dac`, `suffix`, `account_type`, `account_holder`, `category_id`, `segment_code`, `person_type_code`, `updated_at`.

## Frontend Coding Patterns

**Standalone components only** — no `NgModule`. Global providers in `app.config.ts`.

**State: Signals for UI, RxJS for I/O:**
- Local/derived state → `signal()`, `computed()`
- HTTP and async streams → RxJS `Observable`
- Prefer `async` pipe or `toSignal()` over `subscribe()` in components
- When using `subscribe()`, always cleanup with `takeUntilDestroyed()`

**Components:**
- `ChangeDetectionStrategy.OnPush` on all new components
- One responsibility per component; keep logic in the `.ts`, not the template

**HTTP services:** centralize in `services/` within each feature; always type responses (`Observable<MyType>`); handle errors with `catchError` + `MatSnackBar`.

**Routing:** lazy-loaded via `loadComponent` for pages, `loadChildren` for feature route groups.

**UI:** Angular Material is the only UI library. Use `MatSnackBar` for quick messages, `MatDialog` for confirmations/edits, `MatTable` + `MatPaginator`/`MatSort` for lists.

**SCSS:** Global styles only in `src/styles.scss`. Component styles in their own `.scss` file.

**Formatting:** Prettier is configured (printWidth 100, singleQuote, angular HTML parser). Run `npx prettier --write` on changed files.

**Tests (Vitest):**
- Services with HTTP: use `provideHttpClient()` + `provideHttpClientTesting()` + `HttpTestingController`; call `httpMock.verify()` in `afterEach`
- Components: add `provideNoopAnimations()` alongside HTTP providers; test render + key interactions
- Every new feature needs at least one service test and one component test

## What NOT to Do (Frontend)

- Do not add `NgModule`
- Do not introduce a global state manager (NgRx, Akita, etc.)
- Do not create custom UI components that Angular Material already provides
- Do not hardcode colors outside the Material theme
- Do not restructure the project without explicit request
- Avoid `any` types
