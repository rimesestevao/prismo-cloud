# Prismo Cloud 🏦

Sistema backend para gerenciamento financeiro pessoal. Recebe transações do cliente, processa e armazena dados estruturados no PostgreSQL para análises futuras.

## 📋 Índice

- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [API Endpoints](#api-endpoints)
- [Setup do Projeto](#setup-do-projeto)
- [Docker](#docker)
- [To Do List](#to-do-list)

## 🏗️ Arquitetura

### Fluxo de Dados

```mermaid
graph TD
    A[Prismo Client] -->|POST /transactions| B[REST API]
    B --> C[Validação & Auth]
    C --> D[MongoDB - Raw Data]
    D -->|Flag: not_processed| E[Background Processor]
    E --> F[Data Extraction & Transform]
    F --> G[PostgreSQL - Structured Data]
    G --> H[Update MongoDB Flag]
    H -->|Flag: processed| I[Success Response]
    

```

### Arquitetura de Sistema

```mermaid
graph TB
    subgraph "Prismo Client"
        CLIENT[Mobile/Web App]
    end
    
    subgraph "Prismo Cloud"
        subgraph "API Layer"
            REST[REST API Server]
            AUTH[Auth Middleware]
        end
        
        subgraph "Processing Layer"
            PROCESSOR[Background Processor]
            TRANSFORMER[Data Transformer]
        end
        
        subgraph "Data Layer"
            MONGO[(MongoDB<br/>Raw Transactions)]
            POSTGRES[(PostgreSQL<br/>Structured Data)]
        end
    end
    
    CLIENT -->|HTTPS| REST
    REST --> AUTH
    AUTH --> MONGO
    MONGO --> PROCESSOR
    PROCESSOR --> TRANSFORMER
    TRANSFORMER --> POSTGRES
    TRANSFORMER --> MONGO
    

```

## 🛠️ Tecnologias

- **Runtime**: Node.js
- **Linguagem**: TypeScript
- **Framework**: Express.js
- **Bancos de Dados**: 
  - MongoDB (dados brutos/temporários)
  - PostgreSQL (dados estruturados)
- **ORM**: Prisma (PostgreSQL)
- **ODM**: Mongoose (MongoDB)
- **Containerização**: Docker & Docker Compose
- **Validação**: Zod
- **Logging**: Winston

## 📁 Estrutura do Projeto

```
prismo-cloud/
├── src/
│   ├── controllers/        # Controladores da API
│   ├── middleware/         # Middlewares (auth, validation, etc)
│   ├── models/            # Modelos do MongoDB
│   ├── services/          # Lógica de negócio
│   ├── processors/        # Processadores de dados
│   ├── types/             # Definições de tipos TypeScript
│   ├── utils/             # Utilitários
│   ├── prisma/            # Schema e migrations do Prisma
│   └── app.ts             # Configuração principal da aplicação
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── tests/
├── docs/
└── README.md
```

## 🗄️ Banco de Dados

### MongoDB (Dados Brutos)

Collection: `raw_transactions`

```typescript
{
  _id: ObjectId,
  transactionIdApp: string,
  rawData: object,      // JSON completo recebido do client
  processed: boolean,   // Flag de processamento
  createdAt: Date,
  processedAt?: Date,
  apiToken: string,     // Token do usuário
  processingErrors?: string[]
}
```

### PostgreSQL (Dados Estruturados)

```mermaid
erDiagram
    users {
        id SERIAL PK
        email VARCHAR(255) UNIQUE
        api_token VARCHAR(255) UNIQUE
        created_at TIMESTAMP
        updated_at TIMESTAMP
    }
    
    transactions {
        id SERIAL PK
        user_id INTEGER FK
        transaction_id_app VARCHAR(255) UNIQUE
        amount INTEGER
        transaction_type INTEGER
        description TEXT
        transaction_timestamp TIMESTAMP
        category VARCHAR(100)
        created_at TIMESTAMP
        updated_at TIMESTAMP
    }
    
    counterparties {
        id SERIAL PK
        transaction_id INTEGER FK
        name VARCHAR(255)
        is_known BOOLEAN
    }
    
    payment_methods {
        id SERIAL PK
        transaction_id INTEGER FK
        type VARCHAR(50)
        provider VARCHAR(100)
        nickname VARCHAR(255)
        last_four VARCHAR(4)
    }
    
    transaction_tags {
        id SERIAL PK
        transaction_id INTEGER FK
        tag VARCHAR(50)
    }
    
    recurrences {
        id SERIAL PK
        transaction_id INTEGER FK
        is_recurring BOOLEAN
        frequency VARCHAR(20)
        start_date DATE
        end_date DATE
    }
    
    attachments {
        id SERIAL PK
        transaction_id INTEGER FK
        type VARCHAR(50)
        url TEXT
        description TEXT
    }
    
    locations {
        id SERIAL PK
        transaction_id INTEGER FK
        establishment_name VARCHAR(255)
        address TEXT
        latitude DECIMAL(10,8)
        longitude DECIMAL(11,8)
    }
    
    transaction_metadata {
        id SERIAL PK
        transaction_id INTEGER FK
        device_model VARCHAR(100)
        app_version VARCHAR(20)
    }
    
    users ||--o{ transactions : "has"
    transactions ||--o| counterparties : "has"
    transactions ||--o| payment_methods : "has"
    transactions ||--o{ transaction_tags : "has"
    transactions ||--o| recurrences : "has"
    transactions ||--o{ attachments : "has"
    transactions ||--o| locations : "has"
    transactions ||--o| transaction_metadata : "has"
```

## 🔌 API Endpoints

### POST `/api/v1/transactions`

Recebe uma nova transação do cliente.

**Headers:**
```
Authorization: Bearer {api_token}
Content-Type: application/json
```

**Body:**
```json
{
  "transactionIdApp": "uuid-gerado-no-app-12345",
  "amount": 15075,
  "transactionType": 1,
  "description": "Jantar com a equipe do projeto",
  "transactionTimestamp": "2025-08-15T22:30:00Z",
  "category": "Alimentação",
  "tags": ["trabalho", "restaurante", "pizza"],
  "counterparty": {
    "name": "Pizzaria do Bairro",
    "isKnown": true
  },
  "paymentMethod": {
    "type": "CREDIT_CARD",
    "provider": "Visa",
    "nickname": "Cartão de Crédito Principal",
    "last4": "1234"
  },
  "recurrence": {
    "isRecurring": false,
    "frequency": null,
    "startDate": null,
    "endDate": null
  },
  "attachments": [
    {
      "type": "image/jpeg",
      "url": "https://example.com/attachment1.jpg",
      "description": "Foto do recibo do jantar"
    }
  ],
  "location": {
    "establishmentName": "Pizzaria do Bairro",
    "address": "Rua das Flores, 123",
    "latitude": -23.550520,
    "longitude": -46.633308
  },
  "metadata": {
    "deviceModel": "iPhone 15 Pro",
    "appVersion": "1.1.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction received and queued for processing",
  "transactionId": "uuid-gerado-no-app-12345"
}
```

### GET `/api/v1/health`

Health check da aplicação.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-24T10:30:00Z",
  "services": {
    "mongodb": "connected",
    "postgresql": "connected"
  }
}
```

## 🚀 Setup do Projeto

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- Git

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/prismo-cloud.git
cd prismo-cloud
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute as migrations do banco:**
```bash
npx prisma migrate dev
```

5. **Inicie o projeto em desenvolvimento:**
```bash
npm run dev
```

### Variáveis de Ambiente

```env
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/prismo

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/prismo

# Logs
LOG_LEVEL=info
```

## 🐳 Docker

### Desenvolvimento

```bash
# Subir todos os serviços
docker-compose up -d

# Logs
docker-compose logs -f app

# Parar serviços
docker-compose down
```

### Produção

```bash
# Build da imagem
docker build -t prismo-cloud .

# Run
docker run -d \
  --name prismo-cloud \
  -p 3000:3000 \
  --env-file .env \
  prismo-cloud
```

## 📝 To Do List

### 🔐 Autenticação & Segurança
- [ ] Implementar autenticação robusta (JWT/OAuth)
- [ ] Sistema de registro automático de usuários via API
- [ ] Rate limiting e proteção contra ataques
- [ ] Criptografia de dados sensíveis

### 📱 Sincronização & Notificações
- [ ] Sistema de sincronização entre dispositivos do mesmo usuário
- [ ] Implementar notificações push
- [ ] Offline-first com sincronização quando online
- [ ] Conflito resolution para dados modificados offline

### 🤖 Inteligência & Automação
- [ ] Categorização automática baseada em ML
- [ ] Detecção de transações duplicadas
- [ ] Sugestões inteligentes de categorias
- [ ] Detecção de padrões de gastos

### 📊 Funcionalidades Financeiras
- [ ] Sistema de metas e orçamentos por categoria
- [ ] Relatórios financeiros (mensal, anual, por categoria)
- [ ] Alertas de gastos excessivos
- [ ] Previsões de gastos baseadas no histórico
- [ ] Dashboard com insights financeiros

### 🔗 Integrações
- [ ] API para importação automática de bancos
- [ ] Integração com cartões de crédito
- [ ] Webhook para notificações em tempo real
- [ ] Export de dados (CSV, PDF, Excel)

### 🛠️ Infraestrutura & Performance
- [ ] Sistema de cache (Redis)
- [ ] Background jobs com fila (Bull/Agenda)
- [ ] Monitoramento e métricas (Prometheus/Grafana)
- [ ] Backup automático dos dados
- [ ] CI/CD pipeline
- [ ] Testes automatizados (unit, integration, e2e)

### 📈 Analytics & Observabilidade
- [ ] Logging estruturado com ELK Stack
- [ ] Métricas de uso da aplicação
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (APM)

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Prismo Cloud** - Transformando dados financeiros em insights valiosos 💎