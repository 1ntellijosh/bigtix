/**
 * Event model for tickets-srv
 *
 * @since tickets-srv--JP
 */
import mongoose from "mongoose";

interface NewEventAttrs {
  title: string;
  date: Date;
  description: string;
  location: string;
  image: string | null;
}

interface SavedEventDoc extends mongoose.Document {
  id: string;
  title: string;
  date: Date;
  description: string;
  location: string;
  image: string | null;
}

interface EventModel extends mongoose.Model<SavedEventDoc> {
  /**
   * Builds a new event document
   *
   * @param {NewEventAttrs} attrs  The attributes for the new event
   *
   * @returns {SavedEventDoc}  The new event document
   */
  build(attrs: NewEventAttrs): SavedEventDoc;
}

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
}, {
  toJSON: {
    // Clean up the user object before returning it
    transform(doc, ret) {
      const eventObj = ret as Record<string, unknown>;
      eventObj.id = eventObj._id;
      delete eventObj._id;
      delete eventObj.__v;
    },
  },
});

/**
 * Builds a new event document
 *
 * @param {NewEventAttrs} attrs  The attributes for the new event
 *
 * @returns {SavedEventDoc}  The new event document
 */
eventSchema.statics.build = (attrs: NewEventAttrs) => {
  return new Event(attrs);
};

const Event = mongoose.model<SavedEventDoc, EventModel>('Event', eventSchema);

export { Event, SavedEventDoc, NewEventAttrs };