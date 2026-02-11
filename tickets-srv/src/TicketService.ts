/**
 * Class for Tickets Service business logic
 *
 * @since tickets-srv--JP
 */
import { TicketRepository } from './repositories/TicketRepository';
import { SavedTicketDoc } from './models/Ticket';
import { BadRequestError, NotFoundError, ServerError } from '@bigtix/common';
import { OrderCreatedData, OrderStatusUpdatedData } from '@bigtix/middleware';
import { EventPublisher } from '@bigtix/middleware';
import { TicketEventFactory } from './events/TicketEventFactory';
import { EventTypesEnum } from '@bigtix/middleware';

export class TicketService {
  private tickRepo: TicketRepository;

  constructor() {
    this.tickRepo = new TicketRepository();
  }

  /**
   * Creates a new ticket
   *
   * @param {string} title
   * @param {string} price
   * @param {string} userId
   * @param {string} serialNumber
   * @param {string} eventId
   *
   * @returns {Promise<SavedUserDoc>}
   * 
   * @throws {BadRequestError}  If email is already in use
   */
  async createTicket(title: string, price: number, userId: string, description: string, serialNumber: string, eventId: string): Promise<SavedTicketDoc> {
    /**
     * TODO: Add validation for the ticket data:
     * - check event (exists, date, location, etc.)
     * - check ticket (serial number, description, etc. would technically be done via API)
     */
    // If the ticket already exists, throw an error (need to add some kind of serial number to the ticket)
    const savedTicket = await this.tickRepo.findBySerialNumber(serialNumber);
    if (savedTicket) throw new BadRequestError('Ticket already exists');

    // Create the ticket
    const ticket = await this.tickRepo.create({ title, price, userId, description, serialNumber, eventId });
    
    // Notify the ticket created event to the event bus
    await this.notifyTicketCreatedEvent(ticket);

    return ticket;
  }

  /**
   * Retrieves a ticket by id
   *
   * @param {string} id  The id of the ticket to retrieve
   *
   * @returns {Promise<SavedTicketDoc>}
   */
  async getTicketById(id: string): Promise<SavedTicketDoc> {
    const ticket = await this.tickRepo.findById(id);
    
    if (!ticket) throw new NotFoundError('Ticket not found');
    
    return ticket;
  }

  /**
   * Retrieves a ticket by serial number
   *
   * @param {string} serialNumber  The serial number of the ticket to retrieve
   *
   * @returns {Promise<SavedTicketDoc>}
   */
  async getTicketBySerialNumber(serialNumber: string): Promise<SavedTicketDoc> {
    const ticket = await this.tickRepo.findBySerialNumber(serialNumber);
    
    if (!ticket) throw new NotFoundError('Ticket not found');
    
    return ticket;
  }

  /**
   * Retrieves all tickets for a given event id
   *
   * @param {string} eventId  The event id of the ticket to retrieve
   *
   * @returns {Promise<SavedTicketDoc[]>}
   */
  async getTicketsByEventId(eventId: string): Promise<SavedTicketDoc[]> {
    const tickets = await this.tickRepo.findByEventId(eventId);
    
    return tickets || [];
  }

  /**
   * Retrieves all tickets for a given user
   *
   * @param {string} userId  The userId of the user to retrieve tickets for
   *
   * @returns {Promise<SavedTicketDoc[]>}
   */
  async getTicketsByUserId(userId: string): Promise<SavedTicketDoc[]> {
    const tickets = await this.tickRepo.findByUserId(userId);
    
    return tickets || [];
  }

  /**
   * Retrieves all tickets
   *
   * @returns {Promise<SavedTicketDoc[]>}
   */
  async getAllTickets(): Promise<SavedTicketDoc[]> {
    const tickets = await this.tickRepo.findAll();
    
    return tickets || [];
  }

  /**
   * Updates a ticket by id
   *
   * @param {string} id  The id of the ticket to update
   * @param {string} title  The title of the ticket
   * @param {number} price  The price of the ticket
   * @param {string} description  The description of the ticket
   *
   * @returns {Promise<SavedTicketDoc>}
   */
  async updateTicketById(id: string, attrs: { title?: string, price?: number, description?: string, orderId?: string | null }): Promise<SavedTicketDoc> {
    let ticket = await this.tickRepo.findById(id);

    if (!ticket) throw new NotFoundError('Ticket not found');

    const changes = {
      ...attrs,
      version: (ticket.version + 1),
    };
    
    ticket = await this.tickRepo.updateById(id, changes);
    
    if (!ticket) throw new NotFoundError('Ticket not found');

    await this.notifyTicketUpdatedEvent(ticket);
    
    return ticket;
  }

  /**
   * Applies the order id to the tickets that are part of a given created order event. This is used to indicate the
   * associated tickets are attached to a new order. This can have implications for the tickets, such as they cannot be
   * edited or deleted unless the order is cancelled/timed out.
   *
   * @param {OrderCreatedData} data  The order created data
   *
   * @returns {Promise<SavedTicketDoc[]>}
   */
  async onNewOrderEvent(event: OrderCreatedData): Promise<void> {
    try {
      const { orderId, tickets } = event;

      // Update the tickets with the order id
      for (const ticket of tickets) {
        await this.tickRepo.updateById(ticket.ticketId, { orderId });
      }
    } catch (error) {
      console.error('Error in TicketService onNewOrderEvent event:', error);
      /**
       * Throwing server error, which will cause the event to be retried again later by the event bus.
       * TODO: Add logging to the database, for failed events
       */
      const msg = error instanceof Error
        ? 'Cannot process TicketService onNewOrderEvent event: ' + error.message
        : 'Unknown error executing onNewOrderEvent in TicketService';

      throw new ServerError(msg);
    }
  }

  /**
   * Applies the order cancelled to the tickets that are part of a given order cancelled/expired event. This is used to
   * indicate the associated tickets are no longer attached to an order. This can have implications for the
   * tickets, so they can be edited or deleted again
   *
   * @param {OrderCancelledData} data  The order cancelled data
   *
   * @returns {Promise<void>}
   */
  async onOrderCancelOrExpireEvent(event: OrderStatusUpdatedData): Promise<void> {
    try {
      const { tickets } = event;

      // Update the tickets with null order id
      for (const ticket of tickets) {
        await this.tickRepo.updateById(ticket.ticketId, { orderId: null });
      }
    } catch (error) {
      console.error('Error in TicketService onOrderCancelOrExpireEvent event:', error);
      /**
       * Throwing server error, which will cause the event to be retried again later by the event bus.
       * TODO: Add logging to the database, for failed events
       */
      const msg = error instanceof Error
        ? 'Cannot process TicketService onOrderCancelOrExpireEvent event: ' + error.message
        : 'Unknown error executing onOrderCancelOrExpireEvent in TicketService';

      throw new ServerError(msg);
    }
  }

  /**
   * Creates an event publisher for a given event type
   *
   * @param {EventTypesEnum} eventType  The event type to create an event publisher for
   *
   * @returns {EventPublisher}
   */
  createEventPublisher(eventType: EventTypesEnum): EventPublisher {
    return new EventPublisher(
      new TicketEventFactory(eventType)
    );
  }

  /**
   * Notifies the ticket created event to the event bus
   *
   * @param {SavedTicketDoc} createdTicket  The created ticket
   *
   * @returns {Promise<void>}
   */
  async notifyTicketCreatedEvent(createdTicket: SavedTicketDoc): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.TICKET_CREATED);
    await publisher.publishEvent('tickets-srv.ticket-events', EventTypesEnum.TICKET_CREATED, {
      ticketId: createdTicket.id,
      eventId: createdTicket.eventId,
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
  async notifyTicketUpdatedEvent(updatedTicket: SavedTicketDoc): Promise<void> {
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
