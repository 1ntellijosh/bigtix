/**
 * Processed event model for idempotent event consumption.
 * Stores eventId from envelope.metadata so the same event is not applied twice.
 *
 * @since event-bus-idempotency--JP
 */
import mongoose from 'mongoose';

interface ProcessedEventDoc extends mongoose.Document {
  eventId: string;
  processedAt: Date;
}

const processedEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  processedAt: { type: Date, default: Date.now },
});

const ProcessedEvent = mongoose.model<ProcessedEventDoc>('ProcessedEvent', processedEventSchema);

export { ProcessedEvent, ProcessedEventDoc };
