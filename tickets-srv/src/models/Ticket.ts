/**
 * Ticket model for tickets-srv
 *
 * @since tickets-srv--JP
 */
import mongoose from "mongoose";
import { SavedEventDoc } from "./Event";

interface NewTicketAttrs {
  title: string;
  price: number;
  description: string;
  userId: string;
  serialNumber: string;
  event: mongoose.Types.ObjectId | SavedEventDoc | null;
}

interface SavedTicketDoc extends mongoose.Document {
  id: string;
  title: string;
  description: string;
  price: number;
  userId: string;
  serialNumber: string;
  event: mongoose.Types.ObjectId | SavedEventDoc | null;
  version: number;
  orderId?: string;
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
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  serialNumber: {
    type: String,
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  version: {
    type: Number,
    required: true,
  },
  orderId: {
    type: String,
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
  return new Ticket({
    title: attrs.title,
    price: attrs.price,
    userId: attrs.userId,
    description: attrs.description,
    serialNumber: attrs.serialNumber,
    event: attrs.event,
    version: 0,
  });
};

const Ticket = mongoose.model<SavedTicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket, SavedTicketDoc, NewTicketAttrs };