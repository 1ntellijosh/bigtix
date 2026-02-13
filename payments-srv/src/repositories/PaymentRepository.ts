/**
 * Repository for Payment database logic
 *
 * @since payments-srv-start--JP
 */
import { AbstractRepository } from "@bigtix/middleware";
import { Payment, SavedPaymentDoc, NewPaymentAttrs } from "../models/Payment";

export class PaymentRepository implements AbstractRepository {
  /**
   * @inheritdoc
   */
  async create(attrs: NewPaymentAttrs): Promise<any> {
    const payment = Payment.build(attrs);
    await payment.save();

    return payment;
  }

  /**
   * @inheritdoc
   */
  async findById(id: string): Promise<SavedPaymentDoc | null> {
    return Payment.findById(id);
  }

  /**
   * Finds a payment by given orderId
   *
   * @param orderId  The orderId of the charge to find
   *
   * @returns The payment in data store
   */
  async findByOrderId(orderId: string): Promise<SavedPaymentDoc | null> {
    return Payment.findOne({ orderId });
  }

  /**
   * Finds a payment by given userId and orderId
   *
   * @param userId  The userId of the payment to find
   * @param orderId  The orderId of the payment to find
   *
   * @returns The payment in data store
   */
  async findByUserIdAndOrderId(userId: string, orderId: string): Promise<SavedPaymentDoc | null> {
    return Payment.findOne({ userId, orderId });
  }

  /**
   * Finds all payments by given userId
   *
   * @param userId  The userId of the payments to find
   *
   * @returns The payments in data store
   */
  async findAllByUserId(userId: string): Promise<SavedPaymentDoc[] | null> {
    return Payment.find({ userId });
  }

  /**
   * @inheritdoc
   */
  async updateById(id: string, attrs: object): Promise<SavedPaymentDoc | null> {
    return Payment.findByIdAndUpdate(id, attrs, { returnDocument: 'after' });
  }

  /**
   * Updates a payment by given orderId
   *
   * @param orderId  The orderId of the payment to update
   * @param attrs  The attributes to update
   *
   * @returns The updated payment in data store
   */
  async updateByOrderId(orderId: string, attrs: object): Promise<SavedPaymentDoc | null> {
    return Payment.findOneAndUpdate({ orderId }, attrs, { returnDocument: 'after' });
  }

  /**
   * @inheritdoc
   */
  async deleteById(id: string): Promise<SavedPaymentDoc | null> {
    return Payment.findByIdAndDelete(id);
  }
}