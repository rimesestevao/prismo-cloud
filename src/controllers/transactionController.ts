import { Request, Response } from 'express';
import RawTransaction from '../models/RawTransaction';
import logger from '../utils/logger';

export const createTransaction = async (req: Request, res: Response) => {
  const { transactionIdApp } = req.body;
  const apiToken = req.headers.authorization?.split(' ')[1];

  if (!apiToken) {
    return res.status(401).json({ success: false, message: 'Authorization token is required' });
  }

  const rawTransaction = new RawTransaction({
    transactionIdApp,
    rawData: req.body,
    apiToken,
  });

  await rawTransaction.save();

  logger.info(`Transaction ${transactionIdApp} received and queued for processing.`);

  res.status(202).json({
    success: true,
    message: 'Transaction received and queued for processing',
    transactionId: transactionIdApp,
  });
};
