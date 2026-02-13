/**
 * Repository for Order database logic
 *
 * @since payments-srv-start--JP
 */
import { AbstractRepository } from "@bigtix/middleware";
import { Order, SavedOrderDoc, NewOrderAttrs } from "../models/Order";

export class OrderRepository implements AbstractRepository {
  /**
   * @inheritdoc
   */
  async create(attrs: NewOrderAttrs): Promise<any> {
    const order = Order.build(attrs);
    await order.save();

    return order;
  }

  /**
   * @inheritdoc
   */
  async findById(id: string): Promise<SavedOrderDoc | null> {
    return Order.findById(id);
  }

  /**
   * Finds all orders by given userId
   *
   * @param userId  The userId of the orders to find
   *
   * @returns The orders in data store
   */
  async findByUserId(userId: string): Promise<SavedOrderDoc[] | null> {
    return Order.find({ userId });
  }

  /**
   * Finds all orders
   *
   * @returns The orders in data store
   */
  async findAll(): Promise<SavedOrderDoc[] | null> {
    return Order.find();
  }

  /**
   * @inheritdoc
   */
  async updateById(id: string, attrs: object): Promise<SavedOrderDoc | null> {
    // { returnDocument: 'after' } means return the updated document
    return Order.findByIdAndUpdate(id, attrs, { returnDocument: 'after' });
  }

  /**
   * @inheritdoc
   */
  async deleteById(id: string): Promise<SavedOrderDoc | null> {
    return Order.findByIdAndDelete(id);
  }

  /**
   * Deletes all tickets for user by given id
   *
   * @param userId  The userId of the user to delete
   *
   * @returns The number of deleted tickets
   */
  async deleteAllByUserId(userId: string): Promise<number> {
    const result = await Order.deleteMany({ userId });
    return result.deletedCount || 0;
  }
}
