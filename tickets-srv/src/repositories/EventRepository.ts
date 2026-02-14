/**
 * Repository for Event database logic
 *
 * @since create-tickets--JP
 */
import { AbstractRepository } from "@bigtix/middleware";
import { Event, SavedEventDoc, NewEventAttrs } from "../models/Event";

export class EventRepository implements AbstractRepository {
  /**
   * @inheritdoc
   */
  async create(attrs: NewEventAttrs): Promise<any> {
    const event = Event.build(attrs);
    await event.save();

    return event;
  }

  /**
   * @inheritdoc
   */
  async findById(id: string): Promise<SavedEventDoc | null> {
    return Event.findById(id);
  }

  findByTmEventId(tmEventId: string): Promise<SavedEventDoc | null> {
    return Event.findOne({ tmEventId });
  }

  /**
   * Finds an event by given eventId
   *
   * @param eventId  The eventId of the ticket to find
   *
   * @returns The ticket in data store
   */
  async findByEventId(eventId: string): Promise<SavedEventDoc[] | null> {
    return Event.find({ eventId });
  }

  /**
   * Finds all events
   *
   * @returns The tickets in data store
   */
  async findAll(): Promise<SavedEventDoc[] | null> {
    return Event.find();
  }

  /**
   * Finds all events by given ids list
   *
   * @param ids  The ids of the events to find
   *
   * @returns The events in data store
   */
  async findAllEventsInIdsList(ids: string[]): Promise<SavedEventDoc[]> {
    return Event.find({ _id: { $in: ids } }) || [];
  }

  /**
   * @inheritdoc
   */
  async updateById(id: string, attrs: object): Promise<SavedEventDoc | null> {
    // { returnDocument: 'after' } means return the updated document
    return Event.findByIdAndUpdate(id, attrs, { returnDocument: 'after' });
  }

  /**
   * @inheritdoc
   */
  async deleteById(id: string): Promise<SavedEventDoc | null> {
    return Event.findByIdAndDelete(id);
  }
}
