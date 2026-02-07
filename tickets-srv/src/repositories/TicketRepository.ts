/**
 * Repository for Ticket database logic
 *
 * @since tickets-srv--JP
 */
import { AbstractRepository } from "@bigtix/middleware";
import { Ticket, SavedTicketDoc, NewTicketAttrs } from "../models/Ticket";

export class TicketRepository implements AbstractRepository {
  /**
   * @inheritdoc
   */
  async create(attrs: NewTicketAttrs): Promise<any> {
    const ticket = Ticket.build(attrs);
    await ticket.save();

    return ticket;
  }

  /**
   * @inheritdoc
   */
  async findById(id: string): Promise<SavedTicketDoc | null> {
    return Ticket.findById(id);
  }

  /**
   * Finds a ticket by given title
   *
   * @param title  The title of the ticket to find
   *
   * @returns The ticket in data store
   */
  async findByTitle(title: string): Promise<SavedTicketDoc | null> {
    return Ticket.findOne({ title });
  }

  /**
   * Finds all tickets by given userId
   *
   * @param userId  The userId of the tickets to find
   *
   * @returns The tickets in data store
   */
  async findByUserId(userId: string): Promise<SavedTicketDoc[] | null> {
    return Ticket.find({ userId });
  }

  /**
   * Finds a ticket by given eventId
   *
   * @param eventId  The eventId of the ticket to find
   *
   * @returns The ticket in data store
   */
  async findByEventId(eventId: string): Promise<SavedTicketDoc[] | null> {
    return Ticket.find({ eventId });
  }

  /**
   * Finds a ticket by given serial number
   *
   * @param serialNumber  The serial number of the ticket to find
   *
   * @returns The ticket in data store
   */
  async findBySerialNumber(serialNumber: string): Promise<SavedTicketDoc | null> {
    return Ticket.findOne({ serialNumber });
  }

  /**
   * Finds all tickets
   *
   * @returns The tickets in data store
   */
  async findAll(): Promise<SavedTicketDoc[] | null> {
    return Ticket.find();
  }

  /**
   * @inheritdoc
   */
  async updateById(id: string, attrs: object): Promise<SavedTicketDoc | null> {
    // { new: true } means return the updated document
    return Ticket.findByIdAndUpdate(id, attrs, { new: true });
  }

  /**
   * @inheritdoc
   */
  async deleteById(id: string): Promise<SavedTicketDoc | null> {
    return Ticket.findByIdAndDelete(id);
  }

  /**
   * Deletes all tickets for user by given id
   *
   * @param userId  The userId of the user to delete
   *
   * @returns The number of deleted tickets
   */
  async deleteAllByUserId(userId: string): Promise<number> {
    const result = await Ticket.deleteMany({ userId });
    return result.deletedCount || 0;
  }
}
