/**
 * Abstract for a repository that stores processed event ids (idempotency store). This is a middleware because all
 * (express) microservices will have ProcessedEvent Mongoose models, and idempotently consume events using this
 * interface (see packages/middleware/src/eventbus/consumeIdempotently.ts).
 *
 * @since event-bus-idempotency--JP
 */

export abstract class AbstractProcessedEventRepository {
  public abstract isProcessed(eventId: string): Promise<boolean>;
  public abstract markProcessed(eventId: string): Promise<void>;
}
