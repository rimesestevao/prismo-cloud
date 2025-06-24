import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import routes from '../src/routes';
import RawTransaction from '../src/models/RawTransaction';

const app = express();
app.use(express.json());
app.use('/api/v1', routes);

const transactionData = {
  transactionIdApp: 'uuid-gerado-no-app-12345',
  amount: 15075,
  transactionType: 1,
  description: 'Jantar com a equipe do projeto',
  transactionTimestamp: '2025-08-15T22:30:00Z',
  category: 'Alimentação',
  tags: ['trabalho', 'restaurante', 'pizza'],
  counterparty: {
    name: 'Pizzaria do Bairro',
    isKnown: true,
  },
  paymentMethod: {
    type: 'CREDIT_CARD',
    provider: 'Visa',
    nickname: 'Cartão de Crédito Principal',
    last4: '1234',
  },
  recurrence: {
    isRecurring: false,
    frequency: null,
    startDate: null,
    endDate: null,
  },
  attachments: [
    {
      type: 'image/jpeg',
      url: 'https://example.com/attachment1.jpg',
      description: 'Foto do recibo do jantar',
    },
  ],
  location: {
    establishmentName: 'Pizzaria do Bairro',
    address: 'Rua das Flores, 123',
    latitude: -23.55052,
    longitude: -46.633308,
  },
  metadata: {
    deviceModel: 'iPhone 15 Pro',
    appVersion: '1.1.0',
  },
};

describe('POST /api/v1/transactions', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prismo-test');
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
  });

  it('should create a new transaction and return 202', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', 'Bearer test-token')
      .send(transactionData);

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.transactionId).toBe(transactionData.transactionIdApp);

    const rawTx = await RawTransaction.findOne({ transactionIdApp: transactionData.transactionIdApp });
    expect(rawTx).not.toBeNull();
    expect(rawTx?.processed).toBe(false);
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .send(transactionData);

    expect(res.status).toBe(401);
  });
});
