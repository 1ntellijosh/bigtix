/**
 * Order model for orders-srv
 *
 * @since tickets-srv--JP
 */
import mongoose from "mongoose";
import { OrderStatusEnum } from "@bigtix/common";

interface NewOrderAttrs {
  userId: string;
  expiresAt: Date;
  status: OrderStatusEnum;
}

interface SavedOrderDoc extends mongoose.Document {
  id: string;
  userId: string;
  expiresAt: Date | null;
  status: OrderStatusEnum;
}

interface OrderModel extends mongoose.Model<SavedOrderDoc> {
  /**
   * Builds a new order document
   *
   * @param {NewOrderAttrs} attrs  The attributes for the new order
   *
   * @returns {SavedOrderDoc}  The new order document
   */
  build(attrs: NewOrderAttrs): SavedOrderDoc;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: mongoose.Schema.Types.Date,
  },
  status: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    // Clean up the user object before returning it
    transform(doc, ret) {
      const orderObj = ret as Record<string, unknown>;
      orderObj.id = orderObj._id;
      delete orderObj._id;
      delete orderObj.__v;
    },
  },
});

/**
 * Builds a new order document
 *
 * @param {NewOrderAttrs} attrs  The attributes for the new order
 *
 * @returns {SavedOrderDoc}  The new order document
 */
orderSchema.statics.build = (attrs: NewOrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<SavedOrderDoc, OrderModel>('Order', orderSchema);

export { Order, SavedOrderDoc, NewOrderAttrs };