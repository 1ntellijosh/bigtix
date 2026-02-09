/**
 * Ticket model for orders-srv
 * Use Ticket.findById(id).populate('order') to load the Order the ticket belongs to.
 *
 * @since orders-srv--JP
 */
import mongoose from "mongoose";
import { SavedOrderDoc } from "./Order";

interface NewTicketAttrs {
  /** Order id (ObjectId or string). Pass order.id or order._id when creating. */
  order: mongoose.Types.ObjectId | SavedOrderDoc | null;
  title: string;
  price: number;
  version: number;
}

interface SavedTicketDoc extends mongoose.Document {
  id: string;
  /** When unpopulated: Order id. When populated: full Order document. */
  order: mongoose.Types.ObjectId | SavedOrderDoc | null;
  title: string;
  price: number;
  version: number;
}

interface TicketModel extends mongoose.Model<SavedTicketDoc> {
  /**
   * Builds a new ticket document
   *
   * @param {NewTicketAttrs} attrs  The attributes for the new ticket
   *
   * @returns {SavedTicketDoc}  The new ticket document
   */
  build(attrs: NewTicketAttrs): SavedTicketDoc;
}

const ticketSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  title: {
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
    // Clean up the ticket object before returning it
    transform(doc, ret) {
      const ticketObj = ret as Record<string, unknown>;
      ticketObj.id = ticketObj._id;
      delete ticketObj._id;
      delete ticketObj.__v;
    },
  },
});

/**
 * Builds a new ticket document
 *
 * @param {NewTicketAttrs} attrs  The attributes for the new ticket
 *
 * @returns {SavedTicketDoc}  The new ticket document
 */
ticketSchema.statics.build = (attrs: NewTicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<SavedTicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket, SavedTicketDoc, NewTicketAttrs };