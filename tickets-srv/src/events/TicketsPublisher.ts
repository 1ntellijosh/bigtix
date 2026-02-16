/**
 * Holds all logic for publishing events to the event bus for the tickets service
 *
 * @since service-clean--JP
 */
import { EventPublisher } from '@bigtix/middleware';
import { TicketEventDataFactory } from './TicketEventDataFactory';
import { EventTypesEnum } from '@bigtix/middleware';
import { SavedTicketDoc } from '../models/Ticket';

export class TicketsPublisher {
  /**
   * Creates an event publisher for a given event type
   *
   * @param {EventTypesEnum} eventType  The event type to create an event publisher for
   *
   * @returns {EventPublisher}
   */
  static createEventPublisher(eventType: EventTypesEnum): EventPublisher {
    return new EventPublisher(
      new TicketEventDataFactory(eventType)
    );
  }

  /**
   * Notifies the ticket created event to the event bus
   *
   * @param {SavedTicketDoc} createdTicket  The created ticket
   *
   * @returns {Promise<void>}
   */
  static async publishTicketCreatedEvent(createdTicket: SavedTicketDoc): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.TICKET_CREATED);
    await publisher.publishEvent('tickets-srv.ticket-events', EventTypesEnum.TICKET_CREATED, {
      ticketId: createdTicket.id,
      eventId: createdTicket.event!.toString(),
      userId: createdTicket.userId,
      price: createdTicket.price,
      description: createdTicket.description,
      serialNumber: createdTicket.serialNumber,
      title: createdTicket.title,
      version: createdTicket.version,
    });
  }

  /**
   * Notifies the ticket updated event to the event bus
   *
   * @param {SavedTicketDoc} updatedTicket  The updated ticket
   *
   * @returns {Promise<void>}
   */
  static async publishTicketUpdatedEvent(updatedTicket: SavedTicketDoc): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.TICKET_UPDATED);
    await publisher.publishEvent('tickets-srv.ticket-events', EventTypesEnum.TICKET_UPDATED, {
      ticketId: updatedTicket.id,
      price: updatedTicket.price,
      description: updatedTicket.description,
      title: updatedTicket.title,
      version: updatedTicket.version,
    });
  }
}