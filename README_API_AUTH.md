# Autenticação da API Prismo Cloud

Este documento descreve como usar a autenticação por API Key na API Prismo Cloud.

## Configuração

### 1. Variáveis de Ambiente

A API Key deve ser configurada através da variável de ambiente `API_KEY`:

```bash
# No arquivo .env
API_KEY=sua-chave-secreta-aqui
```

### 2. Docker Compose

Se estiver usando Docker, a API Key será automaticamente carregada do arquivo `.env`:

```yaml
environment:
  - API_KEY=${API_KEY}
```

## Como Usar

### Headers de Autenticação

Todas as requisições para endpoints protegidos devem incluir o header `Authorization` com a API Key:

```http
Authorization: Bearer sua-chave-secreta-aqui
```

Ou simplesmente:

```http
Authorization: sua-chave-secreta-aqui
```

### Exemplos de Requisições

#### 1. Criar Transação (cURL)

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer prismo-api-key-12345-abcdef-secret" \
  -d '{
    "transactionIdApp": "uuid-exemplo-123",
    "amount": 15075,
    "transactionType": 1,
    "description": "Compra no supermercado",
    "transactionTimestamp": "2025-06-28T19:30:00Z",
    "category": "Alimentação"
  }'
```

#### 2. JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/api/v1/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer prismo-api-key-12345-abcdef-secret'
  },
  body: JSON.stringify({
    transactionIdApp: 'uuid-exemplo-123',
    amount: 15075,
    transactionType: 1,
    description: 'Compra no supermercado',
    transactionTimestamp: '2025-06-28T19:30:00Z',
    category: 'Alimentação'
  })
});
```

#### 3. Python/Requests

```python
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer prismo-api-key-12345-abcdef-secret'
}

data = {
    'transactionIdApp': 'uuid-exemplo-123',
    'amount': 15075,
    'transactionType': 1,
    'description': 'Compra no supermercado',
    'transactionTimestamp': '2025-06-28T19:30:00Z',
    'category': 'Alimentação'
}

response = requests.post(
    'http://localhost:3000/api/v1/transactions',
    headers=headers,
    json=data
)
```

## Endpoints Protegidos

Os seguintes endpoints requerem autenticação:

- `POST /api/v1/transactions` - Criar nova transação

## Endpoints Públicos

Os seguintes endpoints NÃO requerem autenticação:

- `GET /api/v1/health` - Health check da aplicação

## Códigos de Erro

### 401 - Unauthorized

**Cenário 1: Header Authorization ausente**
```json
{
  "error": "Authorization header required",
  "message": "Please provide a valid API key in the Authorization header"
}
```

**Cenário 2: API Key inválida**
```json
{
  "error": "Invalid API key",
  "message": "The provided API key is not valid"
}
```

### 500 - Internal Server Error

**Cenário: API Key não configurada no servidor**
```json
{
  "error": "API key not configured",
  "message": "Server configuration error"
}
```

## Segurança

### Recomendações

1. **Mantenha a API Key segura**: Nunca commit a API Key real no código-fonte
2. **Use HTTPS em produção**: Sempre use conexões seguras em ambiente de produção
3. **Rotacione a API Key regularmente**: Altere a API Key periodicamente
4. **Monitor logs**: Os logs registram tentativas de autenticação inválidas

### Logs de Segurança

A aplicação registra os seguintes eventos relacionados à autenticação:

- Tentativas de acesso sem header Authorization
- Tentativas de acesso com API Key inválida
- Autenticações bem-sucedidas
- Erros de configuração da API Key

## Testando a Autenticação

Para testar se a autenticação está funcionando:

### 1. Teste sem Autenticação (deve falhar)

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{"transactionIdApp": "test"}'
```

Resposta esperada: `401 Unauthorized`

### 2. Teste com API Key Inválida (deve falhar)

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer chave-invalida" \
  -d '{"transactionIdApp": "test"}'
```

Resposta esperada: `401 Unauthorized`

### 3. Teste com API Key Válida (deve funcionar)

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer prismo-api-key-12345-abcdef-secret" \
  -d '{
    "transactionIdApp": "test-123",
    "amount": 1000,
    "transactionType": 1,
    "description": "Teste",
    "transactionTimestamp": "2025-06-28T19:30:00Z"
  }'
```

Resposta esperada: `202 Accepted`

## Executando os Testes

Para executar os testes automatizados que incluem verificação de autenticação:

```bash
npm test
```

Os testes verificam:
- Criação de transação com API Key válida
- Rejeição de requisições sem Authorization header
- Rejeição de requisições com API Key inválida
