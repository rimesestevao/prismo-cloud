import prisma from '../utils/prisma';
import { ITransaction } from '../types/transaction';

export const createStructuredTransaction = async (data: ITransaction) => {
  const {
    transactionIdApp,
    amount,
    transactionType,
    description,
    transactionTimestamp,
    category,
    tags,
    counterparty,
    paymentMethod,
    recurrence,
    attachments,
    location,
    metadata,
    user,
  } = data;

  const transaction = await prisma.transaction.create({
    data: {
      transaction_id_app: transactionIdApp,
      amount,
      transaction_type: transactionType,
      description,
      transaction_timestamp: transactionTimestamp,
      category,
      user: {
        connectOrCreate: {
          where: { email: user.email },
          create: { email: user.email, api_token: user.api_token },
        },
      },
      counterparties: {
        create: counterparty,
      },
      payment_methods: {
        create: paymentMethod,
      },
      transaction_tags: {
        create: tags.map((tag: string) => ({ tag })),
      },
      recurrences: {
        create: recurrence,
      },
      attachments: {
        create: attachments,
      },
      locations: {
        create: location,
      },
      transaction_metadata: {
        create: metadata,
      },
    },
  });

  return transaction;
};
