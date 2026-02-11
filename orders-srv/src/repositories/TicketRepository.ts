/**
 * Repository for Orders Service's Ticket database logic
 *
 * @since orders-srv-start--JP
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
    return Ticket.findById(id).populate('order');
  }

  /**
   * Finds all tickets by given ids, with the order populated
   *
   * @param ids  The ids of the tickets to find
   *
   * @returns The tickets in data store
   */
  async findAllByIds(ids: string[]): Promise<SavedTicketDoc[]> {
    return Ticket.find({ _id: { $in: ids } }).populate('order') || [];
  }

  /**
   * Finds all tickets attached to the given order id.
   *
   * @param orderId  The order id (Order.id or Order._id)
   * @returns The tickets in data store, or null
   */
  async findAllByOrderId(orderId: string): Promise<SavedTicketDoc[] | null> {
    return Ticket.find({ order: orderId });
  }

  /**
   * @inheritdoc
   */
  async updateById(id: string, attrs: object): Promise<SavedTicketDoc | null> {
    // { returnDocument: 'after' } means return the updated document
    return Ticket.findByIdAndUpdate(id, attrs, { returnDocument: 'after' });
  }

  /**
   * Updates all tickets associated with the given order id
   *
   * @param orderId  The orderId of the tickets to update
   * @param attrs  The attributes to update
   *
   * @returns The number of updated tickets
   */
  async updateAllByOrderId(orderId: string, attrs: object): Promise<number> {
    const result = await Ticket.updateMany({ order: orderId }, attrs);

    return result.modifiedCount || 0;
  }

  /**
   * @inheritdoc
   */
  async deleteById(id: string): Promise<SavedTicketDoc | null> {
    return Ticket.findByIdAndDelete(id);
  }

  /**
   * Deletes all tickets for an order by given id
   *
   * @param orderId  The orderId of the tickets to delete
   *
   * @returns The number of deleted tickets
   */
  async deleteAllByOrderId(orderId: string): Promise<number> {
    const result = await Ticket.deleteMany({ order: orderId });

    return result.deletedCount || 0;
  }
}
