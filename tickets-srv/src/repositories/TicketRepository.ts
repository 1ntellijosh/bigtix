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
   * Finds all tickets by given ids list
   *
   * @param ids  The ids of the tickets to find
   *
   * @returns The ticket in data store
   */
  async findAllTicketsInIdsList(ids: string[]): Promise<SavedTicketDoc[]> {
    return Ticket.find({ _id: { $in: ids } }) || [];
  }

  /**
   * @inheritdoc
   */
  async updateById(id: string, attrs: object): Promise<SavedTicketDoc | null> {
    // { returnDocument: 'after' } means return the updated document
    return Ticket.findByIdAndUpdate(id, attrs, { returnDocument: 'after' });
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
