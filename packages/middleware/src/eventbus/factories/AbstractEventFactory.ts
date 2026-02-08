/**
 * Base event factory. Used to create event objects for the event bus.
 *
 * @since event-bus-start--JP
 */
import { EventTypesEnum, SourceServiceEnum } from '../enums/EventsEnums';
import { EventMetadata, EventEnvelope } from '../contracts/EventContracts';
import { EventData } from '../contracts/EventContracts';
import { EVENT_SCHEMA_VERSION } from '../contracts/EventContracts';
import { randomUUID } from 'crypto';

export abstract class AbstractEventFactory {
  protected eventType: EventTypesEnum;
  protected sourceService: SourceServiceEnum;
  protected correlationId?: string | null; // Only set this if publishing event in at least second chain of events
  protected schemaVersion: number = EVENT_SCHEMA_VERSION;
  protected data?: EventData | null = null;

  constructor(eventType: EventTypesEnum, sourceService: SourceServiceEnum, correlationId?: string) {
    this.eventType = eventType;
    this.sourceService = sourceService;
    this.correlationId = correlationId;
  }

  /** Set the event payload, then call buildEvent(). Enables fluent usage: factory.setData(payload).buildEvent() */
  setData(data: EventData): this {
    this.data = this.createEventData(this.eventType, data);

    return this;
  }

  createMetadata(): EventMetadata {
    if (!this.data) {
      throw new Error('Data is required');
    }

    return {
      eventId: randomUUID(),
      eventType: this.eventType,
      eventTimestamp: new Date().toISOString(),
      schemaVersion: this.schemaVersion,
      sourceService: this.sourceService,
      ...(this.correlationId != null && { correlationId: this.correlationId }),
    };
  }

  // Every factory must have a method to build an event from a data object.
  buildEvent(): EventEnvelope {
    if (!this.data) {
      throw new Error('Data is required');
    }

    return {
      metadata: this.createMetadata(),
      data: this.data,
    };
  }

  /** Build event-specific data from the given payload. Subclasses implement for each event type. */
  abstract createEventData(eventType: EventTypesEnum, data: any): Record<string, any>;
}
