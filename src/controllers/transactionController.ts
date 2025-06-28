import { Request, Response } from 'express';
import RawTransaction from '../models/RawTransaction';
import logger from '../utils/logger';

export const createTransaction = async (req: Request, res: Response) => {
  const { transactionIdApp } = req.body;

  const rawTransaction = new RawTransaction({
    transactionIdApp,
    rawData: req.body,
  });

  await rawTransaction.save();

  logger.info(`Transaction ${transactionIdApp} received and queued for processing.`);

  res.status(202).json({
    success: true,
    message: 'Transaction received and queued for processing',
    transactionId: transactionIdApp,
  });
};

export const getTransactions = async (req: Request, res: Response) => {
  const transactions = await RawTransaction.find({ processed: false });

  res.status(200).json({
    success: true,
    transactions,
  });
};

export const getTransaction = async (req: Request, res: Response) => {
  const { transactionId } = req.params;

  const transaction = await RawTransaction.findOne({ transactionIdApp: transactionId });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
  }

  res.status(200).json({
    success: true,
    transaction,
  });
};

export const getLastTransaction = async (req: Request, res: Response) => {
  const transactions = await RawTransaction.find({ processed: false }).sort({ createdAt: -1 }).limit(1);

  if (transactions.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No transactions found',
    });
  }

  res.status(200).json({
    success: true,
    transaction: transactions[0],
  });
};
