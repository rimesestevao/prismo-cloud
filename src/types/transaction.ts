export interface ITransaction {
  transactionIdApp: string;
  amount: number;
  transactionType: number;
  description: string;
  transactionTimestamp: Date;
  category: string;
  tags: string[];
  counterparty: {
    name: string;
    is_known: boolean;
  };
  paymentMethod: {
    type: string;
    provider: string;
    nickname?: string;
    last_four?: string;
  };
  recurrence: {
    is_recurring: boolean;
    frequency?: string;
    start_date?: Date;
    end_date?: Date;
  };
  attachments: {
    type: string;
    url: string;
    description?: string;
  }[];
  location: {
    establishment_name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  metadata: {
    device_model?: string;
    app_version?: string;
  };
  user: {
    email: string;
    api_token: string;
  };
}
