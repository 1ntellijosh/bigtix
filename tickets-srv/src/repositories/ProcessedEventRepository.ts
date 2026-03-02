/**
 * Repository for processed event bus message ids (idempotency store).
 *
 * @since event-bus-idempotency--JP
 */
import { AbstractProcessedEventRepository } from '@bigtix/middleware';
import { ProcessedEvent } from '../models/ProcessedEvent';

export class ProcessedEventRepository extends AbstractProcessedEventRepository {
  async isProcessed(eventId: string): Promise<boolean> {
    const doc = await ProcessedEvent.findOne({ eventId });
    return doc != null;
  }

  async markProcessed(eventId: string): Promise<void> {
    try {
      await ProcessedEvent.create({ eventId });
    } catch (err: any) {
      if (err?.code !== 11000) throw err;
    }
  }
}
