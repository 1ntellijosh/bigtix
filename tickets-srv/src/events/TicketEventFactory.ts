/**
 * Ticket service event builder.
 *
 * @since event-bus-start--JP
 */
import { AbstractEventFactory } from '@bigtix/middleware';
import { EventTypesEnum, SourceServiceEnum } from '@bigtix/middleware';
import { TicketCreatedData, TicketDeletedData, TicketUpdatedData } from '@bigtix/middleware';

export class TicketEventFactory extends AbstractEventFactory {
  constructor(eventType: EventTypesEnum, correlationId?: string) {
    super(eventType, SourceServiceEnum.TICKETS_SRV, correlationId);
  }

  /**
   * @inheritdoc
   */
  createEventData(eventType: EventTypesEnum, data: any): TicketCreatedData | TicketUpdatedData | TicketDeletedData {
    switch (eventType) {
      case EventTypesEnum.TICKET_CREATED:
        return {
          ticketId: data.ticketId,
          eventId: data.eventId,
          userId: data.userId,
          price: data.price,
          description: data.description,
          serialNumber: data.serialNumber,
          title: data.title,
        } as TicketCreatedData;
      case EventTypesEnum.TICKET_UPDATED:
        return {
          ticketId: data.ticketId,
          price: data.price,
          description: data.description,
          title: data.title,
        } as TicketUpdatedData;
      case EventTypesEnum.TICKET_DELETED:
      case EventTypesEnum.TICKET_SOLD:
      case EventTypesEnum.TICKET_CANCELLED:
      case EventTypesEnum.TICKET_REFUNDED:
        return { ticketId: data.ticketId } as TicketDeletedData;
      default:
        throw new Error(`Event type ${eventType} not supported`);
    }
  }
}
