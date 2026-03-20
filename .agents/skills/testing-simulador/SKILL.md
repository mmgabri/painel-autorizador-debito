# Testing: Simulador Autorizador Debito

## Overview
The Simulador feature is an Angular 21 frontend (port 4200) backed by a Java Spring Boot backend (port 8080). Testing requires both services running locally.

## Devin Secrets Needed
No secrets required - the app runs locally with mock data stored in CSV.

## Backend Setup
- Located at `backend/debit-authorizer-simulator/`
- Requires Java and Maven. The pom.xml targets Java 25; if only Java 17 is available, temporarily change `<java.version>` and `<release>` to `17` in pom.xml for local testing (do NOT commit this change).
- Build: `mvn clean package -DskipTests` in the backend directory
- Run: `java -jar target/debit-authorizer-simulator-1.0-SNAPSHOT.jar`
- Runs on port 8080
- Data is stored in `src/main/resources/cenarios_testes.csv`

## Frontend Setup
- Located at `frontend/`
- Run: `npx ng serve --host 0.0.0.0` in the frontend directory
- Runs on port 4200
- Environment config: `src/app/environments/environment.ts` defines `apiBaseUrlJava: 'http://localhost:8080'`

## Key Navigation Paths
- **Pesquisar Cenarios**: Default tab, lists saved scenarios with play/edit/delete icons
- **Disparar transacao**: Click play icon on a scenario to open this view with parsed ISO fields
- **Configurar Cenario**: Second tab for creating/editing scenarios
- **Estorno flow**: In Disparar view, check "Estornar" checkbox -> dialog opens to select ESTORNO model -> delay field appears inline

## Testing Tips
- If no ESTORNO scenarios exist, create one via API: `curl -X POST http://localhost:8080/api/simulador/cenarios/salvar -H 'Content-Type: application/json' -d @/tmp/estorno.json` where the JSON has `nomeProduto: "ESTORNO"`
- The ISO parse API may fail on invalid ISO messages - use messages from existing scenarios for reliable testing
- Network tab in DevTools is useful for verifying API payloads (e.g., confirming `isoMessage` is sent in body vs scenario ID)
- SCSS budget warning (simulador-page.component.scss exceeding 4kB) is pre-existing and not a blocker
- The `npm run build` command runs from the `frontend/` directory
- Maven might not be pre-installed - install with `sudo apt-get install maven`

## API Endpoints
- `POST /api/simulador/iso/parse` - Parse ISO hex message
- `POST /api/simulador/iso/build` - Build ISO from MTI + fields
- `POST /api/simulador/cenarios/salvar` - Save/update scenario
- `POST /api/simulador/cenarios/execucao` - Execute transaction by isoMessage
- `GET /api/simulador/cenarios` - List scenarios (optional filters: nomeProduto, tag)
- `DELETE /api/simulador/cenarios/{id}` - Delete scenario
