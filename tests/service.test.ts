import prisma from '../src/utils/prisma';
import { createStructuredTransaction } from '../src/services/transactionService';
import { ITransaction } from '../src/types/transaction';

const transactionData: ITransaction = {
  transactionIdApp: 'uuid-service-test-123',
  amount: 15075,
  transactionType: 1,
  description: 'Jantar com a equipe do projeto',
  transactionTimestamp: new Date('2025-08-15T22:30:00Z'),
  category: 'Alimentação',
  tags: ['trabalho', 'restaurante', 'pizza'],
  counterparty: {
    name: 'Pizzaria do Bairro',
    is_known: true,
  },
  paymentMethod: {
    type: 'CREDIT_CARD',
    provider: 'Visa',
    nickname: 'Cartão de Crédito Principal',
    last_four: '1234',
  },
  recurrence: {
    is_recurring: false,
  },
  attachments: [
    {
      type: 'image/jpeg',
      url: 'https://example.com/attachment1.jpg',
      description: 'Foto do recibo do jantar',
    },
  ],
  location: {
    establishment_name: 'Pizzaria do Bairro',
    address: 'Rua das Flores, 123',
    latitude: -23.55052,
    longitude: -46.633308,
  },
  metadata: {
    device_model: 'iPhone 15 Pro',
    app_version: '1.1.0',
  },
  user: {
    email: 'test@example.com',
    api_token: 'test-token-service',
  },
};

describe('Transaction Service', () => {
  beforeEach(async () => {
    await prisma.transactionMetadata.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.attachment.deleteMany({});
    await prisma.recurrence.deleteMany({});
    await prisma.transactionTag.deleteMany({});
    await prisma.paymentMethod.deleteMany({});
    await prisma.counterparty.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Delete in reverse order of creation to avoid foreign key constraints
    await prisma.transactionMetadata.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.attachment.deleteMany({});
    await prisma.recurrence.deleteMany({});
    await prisma.transactionTag.deleteMany({});
    await prisma.paymentMethod.deleteMany({});
    await prisma.counterparty.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should create a structured transaction in postgres', async () => {
    const transaction = await createStructuredTransaction(transactionData);
    expect(transaction).toHaveProperty('id');
    expect(transaction.transaction_id_app).toBe(transactionData.transactionIdApp);

    const dbTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        counterparties: true,
        payment_methods: true,
        transaction_tags: true,
      },
    });

    expect(dbTransaction).not.toBeNull();
    expect(dbTransaction?.counterparties.length).toBe(1);
    expect(dbTransaction?.payment_methods.length).toBe(1);
    expect(dbTransaction?.transaction_tags.length).toBe(3);
  });
});
