# 💳 Painel Autorizador Débito

Plataforma para simulação de transações de débito via protocolo **ISO 8583**, com suporte as bandeiras **Mastercard** e **Visa**. Permite disparar mensagens de autorização, estorno e conciliação.

---

## 🗂️ Estrutura do Projeto

```
painel-autorizador-debito/
├── frontend/                          # Aplicação Angular 21
│   └── src/app/
│       ├── features/
│       │   ├── simulador-autorizador-debito/   # Simulador de mensagens ISO 8583
│       │   ├── consulta-transacoes/            # Consulta e histórico de transações
│       │   └── dashboard-debito/               # Dashboard de métricas
│       ├── core/                      # Serviços singleton, interceptors, guards
│       └── shared/                    # Componentes e diretivas reutilizáveis
│
├── backend/
│   └── debit-authorizer-simulator/    # Aplicação Spring Boot (Java)
│
├── cenarios_testes.csv                # Cenários de teste ISO 8583
└── docker-compose.yml                 # Orquestração dos serviços
```

---

## 🛠️ Tecnologias

| Camada    | Tecnologia                                    |
|-----------|-----------------------------------------------|
| Frontend  | Angular 21, Angular Material 21, RxJS 7.8, TypeScript 5.9 |
| Backend   | Java, Spring Boot, Virtual Threads             |
| Protocolo | ISO 8583 (Mastercard e Visa)                  |
| Container | Docker / Docker Compose                       |

---

## 🚀 Executando com Docker Compose

### Pré-requisitos

- [Docker](https://www.docker.com/) instalado e em execução

### 🔧 Perfil de Desenvolvimento (`dev`)


1. No arquivo `docker-compose.yml`, certifique-se de que a variável de ambiente está configurada como:

   ```yaml
   environment:
     - SPRING_PROFILES_ACTIVE=dev
   ```

2. Suba os serviços:

   ```bash
   docker-compose up
   ```
3. Abra o browser com a url http://localhost:4200/

---

### 🧪 Perfil de Homologação (`hom`)

1. No arquivo `docker-compose.yml`, altere a variável para:

   ```yaml
   environment:
     - SPRING_PROFILES_ACTIVE=hom
   ```

2. Suba os serviços:

   ```bash
   docker-compose up
   ```
3. Abra o browser com a url http://localhost:4200/
---

### 🌐 Portas dos serviços

| Serviço   | Porta |
|-----------|-------|
| Frontend  | [http://localhost:4200](http://localhost:4200) |
| Backend   | [http://localhost:8081](http://localhost:8081) |

---

## 💻 Executando sem Docker

### Frontend (Angular)

> Requer Node.js e npm instalados.

```bash
cd frontend
npm install
npm start
```

A aplicação estará disponível em [http://localhost:4200](http://localhost:4200).

---

### Backend (Spring Boot)

Abra a pasta `./backend/debit-authorizer-simulator` na sua IDE (IntelliJ IDEA, Eclipse, VS Code) e execute a aplicação Spring Boot normalmente.

O backend estará disponível em [http://localhost:8081](http://localhost:8081).

---

## 📋 Cenários de Teste

Os cenários de teste são armazenados no arquivo **`cenarios_testes.csv`** na raiz do repositório. Este arquivo é montado automaticamente como volume no container Docker e serve como fonte de dados para o simulador.

### Estrutura do arquivo CSV

| Campo            | Descrição                                               |
|------------------|---------------------------------------------------------|
| `id`             | Identificador único do cenário (UUID)                   |
| `product_name`   | Nome do produto                                 |
| `message_model`  | Modelo da mensagem (`SINGLE_MESSAGE` / `DUAL_MESSAGE`)  |
| `message_type`   | Tipo da mensagem (`AUTORIZACAO` / `CONCILIACAO`)        |
| `payment_network`| Bandeira (`MASTERCARD` / `VISA`)                        |
| `tag`            | Tags para categorização e filtragem                     |
| `description`    | Descrição do cenário                                    |
| `message`        | Mensagem ISO 8583, ou Posicional em hexadecimal                        |
| `updated_at`     | Data/hora da última atualização                         |

### Exemplos de cenários disponíveis

- `COMPRA_COM_CHIP_SENHA_MASTER` — Single Message, Mastercard
- `COMPRA_CNTACTLESS_MASTER` — Dual Message, Mastercard (contactless)
- `COMPRA_COM_CHIP_SENHA_VISA` — Dual Message, Visa
- `ESTORNO_SINGLE_MASTER` — Estorno Single Message, Mastercard
- `ESTORNO_DUAL_MASTER` — Estorno Dual Message, Mastercard
- `ESTORNO_VISA` — Estorno Dual Message, Visa
- `CONCILIACAO_MASTER_DUAL_MESSAGE` — Conciliação Dual Message, Mastercard
- `CONCILIACAO_SINGLE_MESSAGE` — Conciliação Single Message, Mastercard

> Os cenários podem ser criados, editados e excluídos diretamente pela interface do simulador. As alterações são persistidas automaticamente no arquivo CSV.

---

## ⚙️ Configuração de Perfis (Spring Boot)

O backend suporta dois perfis configuráveis via `SPRING_PROFILES_ACTIVE`:

| Perfil | Porta | Nível de Log (app) | Uso recomendado          |
|--------|-------|--------------------|--------------------------|
| `dev`  | 8081  | DEBUG              | Desenvolvimento local    |
| `hom`  | 8081  | INFO               | Homologação / pré-prod   |

---

## 📁 Arquivo `cenarios_testes.csv` no Docker

O `docker-compose.yml` monta o arquivo CSV da raiz do repositório diretamente no container:

```yaml
volumes:
  - ./cenarios_testes.csv:/app/data/cenarios_testes.csv
```

Isso garante que os cenários editados pela interface sejam **persistidos no repositório**, mesmo após o container ser reiniciado.
