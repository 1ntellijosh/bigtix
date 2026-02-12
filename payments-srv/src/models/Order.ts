/**
 * Order model for payments-srv
 *
 * @since payments-srv-start--JP
 */
import mongoose from "mongoose";
import { OrderStatusEnum } from "@bigtix/common";

interface NewOrderAttrs {
  id: string;
  userId: string;
  status: OrderStatusEnum;
  price: number;
}

interface SavedOrderDoc extends mongoose.Document {
  id: string;
  userId: string;
  status: OrderStatusEnum;
  price: number;
  version: number;
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
  status: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  version: {
    type: Number,
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
  return new Order({
    _id: attrs.id,
    userId: attrs.userId,
    status: attrs.status,
    price: attrs.price,
    version: 0,
  });
};

const Order = mongoose.model<SavedOrderDoc, OrderModel>('Order', orderSchema);

export { Order, SavedOrderDoc, NewOrderAttrs };