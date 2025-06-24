import { Schema, model, Document } from 'mongoose';

interface IProcessingLog extends Document {
  rawTransactionId: Schema.Types.ObjectId;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  createdAt: Date;
}

const ProcessingLogSchema = new Schema<IProcessingLog>({
  rawTransactionId: { type: Schema.Types.ObjectId, ref: 'RawTransaction', required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILURE'], required: true },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const ProcessingLog = model<IProcessingLog>('ProcessingLog', ProcessingLogSchema);

export default ProcessingLog;
