/**
 * Class for Tickets Service business logic
 *
 * @since tickets-srv--JP
 */
import { TicketRepository } from './repositories/TicketRepository';
import { SavedTicketDoc } from './models/Ticket';
import { BadRequestError, NotFoundError } from '@bigtix/common';

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
  async updateTicketById(id: string, title: string, price: number, description: string): Promise<SavedTicketDoc> {
    const ticket = await this.tickRepo.updateById(id, { title, price, description });
    
    if (!ticket) throw new NotFoundError('Ticket not found');
    
    return ticket;
  }
}
