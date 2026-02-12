/**
 * Payment model for payments-srv
 *
 * @since payments-srv-start--JP
 */
import mongoose from "mongoose";
import { PaymentStatusEnum } from "@bigtix/common";

interface NewPaymentAttrs {
  orderId: string;
  stripePayIntentId: string;
  status: PaymentStatusEnum;
}

interface SavedPaymentDoc extends mongoose.Document {
  id: string;
  orderId: string;
  stripePayIntentId: string;
  status: PaymentStatusEnum;
}

interface PaymentModel extends mongoose.Model<SavedPaymentDoc> {
  /**
   * Builds a new payment document
   *
   * @param {NewPaymentAttrs} attrs  The attributes for the new payment
   *
   * @returns {SavedPaymentDoc}  The new payment document
   */
  build(attrs: NewPaymentAttrs): SavedPaymentDoc;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  stripePayIntentId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

/**
 * Builds a new payment document
 *
 * @param {NewPaymentAttrs} attrs  The attributes for the new payment
 *
 * @returns {SavedPaymentDoc}  The new payment document
 */
paymentSchema.statics.build = (attrs: NewPaymentAttrs) => {
  return new Payment({
    orderId: attrs.orderId,
    stripePayIntentId: attrs.stripePayIntentId,
    status: attrs.status,
  });
}

const Payment = mongoose.model<SavedPaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment, SavedPaymentDoc, NewPaymentAttrs };