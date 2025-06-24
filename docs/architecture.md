# Architecture

This document provides an overview of the Prismo Cloud architecture, including the main components and their interactions.

## System Overview

Prismo Cloud is designed with a decoupled, service-oriented architecture that allows for scalability, maintainability, and resilience. The system is composed of the following key components:

- **API Gateway:** The entry point for all client requests. It is responsible for request validation, authentication, and routing to the appropriate services.
- **Transaction Ingestion Service:** A lightweight service that receives transaction data from the API Gateway and stores it in a raw format in MongoDB.
- **Transaction Processing Service:** A background worker that asynchronously processes the raw transaction data, transforms it into a structured format, and stores it in PostgreSQL.
- **Databases:**
  - **MongoDB:** Used as a staging area for raw, unstructured transaction data. Its flexible schema is ideal for ingesting data from various sources without strict validation at the entry point.
  - **PostgreSQL:** Used as the primary database for storing structured, processed, and validated transaction data. Its relational nature is ideal for complex queries and data analysis.

## Data Flow

1.  A client sends a `POST` request with transaction data to the `/api/v1/transactions` endpoint.
2.  The API Gateway receives the request, performs initial validation, and forwards it to the Transaction Ingestion Service.
3.  The Transaction Ingestion Service saves the raw transaction data to the `raw_transactions` collection in MongoDB and returns a `202 Accepted` response to the client.
4.  The Transaction Processing Service periodically polls the `raw_transactions` collection for new, unprocessed documents.
5.  For each new document, the processor:
    a.  Transforms the raw data into a structured format.
    b.  Saves the structured data to the `transactions` table and its related tables in PostgreSQL.
    c.  Updates the `processed` flag in the MongoDB document to `true`.
    d.  Creates a log entry in the `processing_logs` collection in MongoDB to record the outcome of the operation.

## Scalability

The architecture is designed to be highly scalable. The API Gateway, Transaction Ingestion Service, and Transaction Processing Service can all be scaled independently to meet the demands of the system. The use of a message queue (or, in this case, a database-as-a-queue) allows for the decoupling of the ingestion and processing services, which is crucial for scalability and resilience.
