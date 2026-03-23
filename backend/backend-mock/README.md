# Backend – Painel Autorizador Debito

Backend Node.js + Express (TypeScript) que expoe um endpoint mock para parse de mensagens ISO8583.

## Instalacao

```bash
cd backend
npm ci
```

## Rodar em desenvolvimento (hot reload)

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`.

## Build e producao

```bash
npm run build
npm start
```

## Testar o endpoint

### Requisicao valida

```bash
curl -X POST http://localhost:3000/api/iso8583/parse \
  -H "Content-Type: application/json" \
  -d '{"message": "0200..."}'
```

Resposta esperada (mock):

```json
{
  "02": "5454545454",
  "03": "003000",
  "04": "000012345",
  "11": "123456",
  "22": "051",
  "41": "TERM0001",
  "42": "MERCHANT000001"
}
```

### Requisicao sem mensagem

```bash
curl -X POST http://localhost:3000/api/iso8583/parse \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'
```

Resposta:

```json
{ "error": "message is required" }
```

### Mock inteligente

O backend retorna maps diferentes dependendo do conteudo da mensagem:

- Contendo `0200` → resposta de autorizacao (purchase)
- Contendo `0210` → resposta de autorizacao (response)
- Contendo `0400` → resposta de reversal
- Qualquer outro conteudo → mock padrao com bits 02, 03, 04
