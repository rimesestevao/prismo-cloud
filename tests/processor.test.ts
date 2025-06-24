import mongoose from 'mongoose';
import RawTransaction from '../src/models/RawTransaction';
import ProcessingLog from '../src/models/ProcessingLog';
import prisma from '../src/utils/prisma';
import { ITransaction } from '../src/types/transaction';

// Mock the service
jest.mock('../src/services/transactionService', () => ({
  createStructuredTransaction: jest.fn(),
}));
import { createStructuredTransaction } from '../src/services/transactionService';

const mockedCreateStructuredTransaction = createStructuredTransaction as jest.Mock;

const transactionData = {
  transactionIdApp: 'uuid-gerado-no-app-12345',
  amount: 15075,
  transactionType: 1,
  description: 'Jantar com a equipe do projeto',
  transactionTimestamp: '2025-08-15T22:30:00Z',
  category: 'Alimentação',
  tags: ['trabalho', 'restaurante', 'pizza'],
  counterparty: { name: 'Pizzaria do Bairro', is_known: true },
  paymentMethod: { type: 'CREDIT_CARD', provider: 'Visa', last4: '1234' },
  recurrence: { is_recurring: false },
  attachments: [],
  location: {},
  metadata: {},
};

import { processTransactions } from '../src/processors/transactionProcessor';


describe('Transaction Processor', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prismo-test');
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await RawTransaction.deleteMany({});
    await ProcessingLog.deleteMany({});
    mockedCreateStructuredTransaction.mockClear();
  });

  it('should process a transaction successfully', async () => {
    const rawTransaction = new RawTransaction({
      transactionIdApp: transactionData.transactionIdApp,
      rawData: transactionData,
      apiToken: 'test-token',
    });
    await rawTransaction.save();

    mockedCreateStructuredTransaction.mockResolvedValueOnce({ id: 1 });

    await processTransactions();

    const processedTx = await RawTransaction.findById(rawTransaction._id);
    expect(processedTx?.processed).toBe(true);

    const log = await ProcessingLog.findOne({ rawTransactionId: rawTransaction._id });
    expect(log?.status).toBe('SUCCESS');

    expect(mockedCreateStructuredTransaction).toHaveBeenCalledTimes(1);
  });

  it('should handle processing failure', async () => {
    const rawTransaction = new RawTransaction({
      transactionIdApp: transactionData.transactionIdApp,
      rawData: transactionData,
      apiToken: 'test-token',
    });
    await rawTransaction.save();

    const errorMessage = 'Failed to insert into PostgreSQL';
    mockedCreateStructuredTransaction.mockRejectedValueOnce(new Error(errorMessage));

    await processTransactions();

    const processedTx = await RawTransaction.findById(rawTransaction._id);
    expect(processedTx?.processed).toBe(false);
    expect(processedTx?.processingErrors).toContain(errorMessage);

    const log = await ProcessingLog.findOne({ rawTransactionId: rawTransaction._id });
    expect(log?.status).toBe('FAILURE');
    expect(log?.errorMessage).toBe(errorMessage);
  });
});
