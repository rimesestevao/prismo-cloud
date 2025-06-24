# API Documentation

This document provides details on the Prismo Cloud API endpoints.

## Base URL

`http://localhost:3000/api/v1`

## Authentication

All requests to the API must include an `Authorization` header with a bearer token.

`Authorization: Bearer <YOUR_API_TOKEN>`

## Endpoints

### Health Check

- **Endpoint:** `GET /health`
- **Description:** Checks the health of the application and its services.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "status": "ok",
      "timestamp": "2025-06-24T05:00:00.000Z",
      "services": {
        "mongodb": "connected",
        "postgresql": "connected"
      }
    }
    ```

### Create Transaction

- **Endpoint:** `POST /transactions`
- **Description:** Receives and queues a new transaction for processing.
- **Request Body:**
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
      "latitude": -23.55052,
      "longitude": -46.633308
    },
    "metadata": {
      "deviceModel": "iPhone 15 Pro",
      "appVersion": "1.1.0"
    }
  }
  ```
- **Success Response:**
  - **Code:** 202 Accepted
  - **Content:**
    ```json
    {
      "success": true,
      "message": "Transaction received and queued for processing",
      "transactionId": "uuid-gerado-no-app-12345"
    }
    ```
- **Error Responses:**
  - **Code:** 401 Unauthorized (if no token is provided)
  - **Code:** 500 Internal Server Error (for any other errors)
