/**
 * Maps order/ticket entities to plain DTOs for API and cross-service use.
 * Stateless only; no repository or DB access.
 *
 * @since service-clean--JP
 */
import { SavedOrderDoc } from '../models/Order';
import { SavedTicketDoc } from '../models/Ticket';
import { OrderStatusEnum } from '@bigtix/common';

export type OrderWithTicketsDto = {
  id: string;
  status: OrderStatusEnum;
  expiresAt: Date;
  userId: string;
  tickets: SavedTicketDoc[];
  version: number;
};

export const OrderMapper = {
  /**
   * Maps an order document and its tickets to a plain DTO (e.g. for GET responses).
   *
   * @param {SavedOrderDoc} order  The order document to map
   * @param {SavedTicketDoc[]} tickets  The tickets to map
   *
   * @returns {OrderWithTicketsDto}  The order with tickets
   */
  toOrderWithTickets(order: SavedOrderDoc, tickets: SavedTicketDoc[]): OrderWithTicketsDto {
    return {
      id: order.id,
      status: order.status,
      expiresAt: order.expiresAt as Date,
      userId: order.userId,
      tickets,
      version: order.version,
    };
  },
};
