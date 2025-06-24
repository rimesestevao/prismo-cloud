# Prismo Cloud

Prismo Cloud is a robust, scalable, and secure financial data processing platform designed to handle a high volume of transactions. It provides a comprehensive solution for receiving, processing, and storing financial data from various sources, ensuring data integrity, security, and availability.

## Features

- **Asynchronous Processing:** Transactions are received and queued for asynchronous processing, ensuring high availability and responsiveness of the API.
- **Dual Database Architecture:** Utilizes MongoDB for storing raw, unstructured transaction data and PostgreSQL for storing structured, processed data, leveraging the strengths of both database types.
- **Scalable Architecture:** Built with a microservices-friendly architecture, allowing for independent scaling of different components.
- **Dockerized Environment:** Fully containerized with Docker and Docker Compose for easy setup, deployment, and portability.
- **Comprehensive Testing:** Includes a full suite of unit, integration, and end-to-end tests to ensure code quality and reliability.
- **Detailed Logging:** Provides detailed logging for all operations, including transaction processing and error handling.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Databases:** MongoDB, PostgreSQL
- **ORM:** Prisma (for PostgreSQL), Mongoose (for MongoDB)
- **Testing:** Jest, Supertest
- **Containerization:** Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker
- Docker Compose

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/rimesestevao/prismo-cloud.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on the `.env.example` file and provide the necessary environment variables.
4.  Start the database containers:
    ```bash
    docker-compose up -d
    ```
5.  Run the database migrations:
    ```bash
    npx prisma migrate dev
    ```
6.  Start the application:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## To-Do

- **Worker Throttling:** Implement limitations on the transaction processor to control the number of transactions processed per run and the time between runs. This will help manage system load and prevent resource exhaustion.
- **Dead-Letter Queue:** Implement a dead-letter queue for transactions that fail to process multiple times. This will allow for manual inspection and reprocessing of failed transactions.
- **Authentication & Authorization:** Enhance the security of the API by implementing a robust authentication and authorization mechanism (e.g., JWT, OAuth2).
- **Data Validation:** Implement comprehensive data validation using a library like Zod to ensure the integrity of incoming data.
- **Monitoring & Alerting:** Integrate a monitoring and alerting solution (e.g., Prometheus, Grafana) to track the health and performance of the application.

## Performance Suggestions

- **Connection Pooling:** Ensure that the database connections are properly managed and pooled to avoid performance bottlenecks.
- **Indexing:** Add appropriate indexes to the database tables to speed up query performance, especially for frequently queried fields.
- **Caching:** Implement a caching layer (e.g., Redis) to cache frequently accessed data and reduce the load on the databases.
- **Load Balancing:** In a production environment, use a load balancer to distribute traffic across multiple instances of the application.

## Security Suggestions

- **Environment Variables:** Never commit sensitive information like API keys and database credentials to the repository. Use environment variables to manage them.
- **Input Validation:** Always validate and sanitize user input to prevent security vulnerabilities like SQL injection and XSS.
- **Rate Limiting:** Implement rate limiting on the API to prevent abuse and denial-of-service attacks.
- **Dependency Scanning:** Regularly scan the project dependencies for known vulnerabilities and update them as needed.
