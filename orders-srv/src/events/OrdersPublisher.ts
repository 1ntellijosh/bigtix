/**
 * Holds all logic for publishing events to the event bus for the orders service
 *
 * @since service-clean--JP
 */
import { EventPublisher } from '@bigtix/middleware';
import { OrderEventDataFactory } from './OrdersEventDataFactory';
import { EventTypesEnum } from '@bigtix/middleware';
import { SavedOrderDoc } from '../models/Order';
import { SavedTicketDoc } from '../models/Ticket';
import { OrderStatusEnum } from '@bigtix/common';

export class OrdersPublisher {
  /**
   * Creates an event publisher for a given event type
   *
   * @param {EventTypesEnum} eventType  The event type to create an event publisher for
   *
   * @returns {EventPublisher}
   */
  static createEventPublisher(eventType: EventTypesEnum): EventPublisher {
    return new EventPublisher(
      new OrderEventDataFactory(eventType)
    );
  }

  /**
   * Publishes order created event to the event bus
   *
   * @param {SavedOrderDoc} order  The order to notify
   *
   * @returns {Promise<void>}
   */
  static async publishOrderCreatedEvent(userId: string, order: SavedOrderDoc, reservedTickets: SavedTicketDoc[]): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.ORDER_CREATED);
    await publisher.publishEvent('orders-srv.order-events', EventTypesEnum.ORDER_CREATED, {
      orderId: order.id,
      userId,
      tickets: reservedTickets.map((ticket: SavedTicketDoc) => ({ ticketId: ticket.id, price: ticket.price })),
      expiresAt: order.expiresAt!.toISOString(),
      status: order.status,
      version: order.version, // 0 is the initial version
    });
  }

  /**
   * Publishes order status changed event to the event bus
   *
   * @param {string} userId  The userId of the user to cancel the order for
   * @param {SavedOrderDoc} order  The order to notify
   *
   * @returns {Promise<void>}
   */
  static async publishOrderStatusChangedEvent(
    status: OrderStatusEnum,
    order: { id: string, status: OrderStatusEnum, expiresAt: Date, userId: string, tickets: SavedTicketDoc[], version: number }
  ): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.ORDER_STATUS_CHANGED);
    await publisher.publishEvent('orders-srv.order-events', EventTypesEnum.ORDER_STATUS_CHANGED, {
      orderId: order.id,
      status,
      tickets: order.tickets.map((ticket: SavedTicketDoc) => ({ ticketId: ticket.id, price: ticket.price })),
      version: order.version,
    });
  }

  /**
   * Publishes order expiration event to the event bus. This message will be delivered by RabbitMQ at the given
   * expiration time, and Orders service will receive it and expire the order
   *
   * @param {string} orderId  The id of the order to expire
   * @param {Date} expiresAt  The expiration date of the order
   *
   * @returns {Promise<void>}
   */
  static async publishOrderExpirationEvent(orderId: string, expiresAt: Date): Promise<void> {
    const publisher = this.createEventPublisher(EventTypesEnum.ORDER_EXPIRED);
    const delayMs = Math.max(0, expiresAt.getTime() - Date.now());
    await publisher.publishEvent(
      'orders-srv.order-events',
      EventTypesEnum.ORDER_EXPIRED,
      { orderId },
      { delayMs }
    );
  }
}
