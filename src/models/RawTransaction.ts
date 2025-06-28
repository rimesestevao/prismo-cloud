import { Schema, model, Document } from 'mongoose';

interface IRawTransaction extends Document {
  transactionIdApp: string;
  rawData: object;
  processed: boolean;
  createdAt: Date;
  processedAt?: Date;
  processingErrors?: string[];
}

const RawTransactionSchema = new Schema<IRawTransaction>({
  transactionIdApp: { type: String, required: true, unique: true },
  rawData: { type: Object, required: true },
  processed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  processingErrors: { type: [String] },
});

const RawTransaction = model<IRawTransaction>('RawTransaction', RawTransactionSchema);

export default RawTransaction;
