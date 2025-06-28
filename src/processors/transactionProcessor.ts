import RawTransaction from '../models/RawTransaction';
import ProcessingLog from '../models/ProcessingLog';
import logger from '../utils/logger';
import { createStructuredTransaction } from '../services/transactionService';
import { ITransaction } from '../types/transaction';

export const processTransactions = async () => {
  const transactions = await RawTransaction.find({ processed: false }).limit(10);

  if (transactions.length === 0) {
    return;
  }

  for (const tx of transactions) {
    try {
      logger.info(`Processing transaction ${tx.transactionIdApp}`);
      
      const rawData = tx.rawData as any;
      const structuredData: ITransaction = {
        transactionIdApp: rawData.transactionIdApp,
        amount: rawData.amount,
        transactionType: rawData.transactionType,
        description: rawData.description,
        transactionTimestamp: new Date(rawData.transactionTimestamp),
        category: rawData.category,
        tags: rawData.tags,
        counterparty: rawData.counterparty,
        paymentMethod: rawData.paymentMethod,
        recurrence: rawData.recurrence,
        attachments: rawData.attachments,
        location: rawData.location,
        metadata: rawData.metadata,
        user: rawData.user,
      };

      await createStructuredTransaction(structuredData);

      tx.processed = true;
      tx.processedAt = new Date();
      await tx.save();

      const log = new ProcessingLog({
        rawTransactionId: tx._id,
        status: 'SUCCESS',
      });
      await log.save();

      logger.info(`Transaction ${tx.transactionIdApp} processed successfully.`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error(`Error processing transaction ${tx.transactionIdApp}:`, error);
      tx.processingErrors = tx.processingErrors
        ? [...tx.processingErrors, errorMessage]
        : [errorMessage];
      await tx.save();

      const log = new ProcessingLog({
        rawTransactionId: tx._id,
        status: 'FAILURE',
        errorMessage,
      });
      await log.save();
    }
  }
};

export const startProcessing = () => {
  setInterval(processTransactions, 10000); // Process every 10 seconds
  logger.info('Transaction processor started.');
};
