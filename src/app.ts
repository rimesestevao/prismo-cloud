import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import logger from './utils/logger';
import routes from './routes';
import { startProcessing } from './processors/transactionProcessor';
import prisma from './utils/prisma';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Conexão com MongoDB usando a variável de ambiente
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prismo')
  .then(() => logger.info('MongoDB connected'))
  .catch((err: Error) => logger.error('MongoDB connection error:', err));

app.use('/api/v1', routes);

// Rota de health check aprimorada
app.get('/api/v1/health', async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        postgresql: 'connected',
      },
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        postgresql: 'disconnected',
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Inicializa o servidor
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  startProcessing();
});

export default app;
