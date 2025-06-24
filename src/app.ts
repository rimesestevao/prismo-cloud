import express from 'express';
import mongoose from 'mongoose';
import logger from './utils/logger';
import routes from './routes';
import { startProcessing } from './processors/transactionProcessor';
import prisma from './utils/prisma';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prismo')
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

app.use('/api/v1', routes);

app.get('/api/v1/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        postgresql: 'connected',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        postgresql: 'disconnected',
      },
    });
  } finally {
    await prisma.$disconnect();
  }
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  startProcessing();
});
