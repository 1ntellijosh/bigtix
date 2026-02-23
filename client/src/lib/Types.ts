/**
 * Structure types for the client
 *
 * @since orders-page--JP
 */
import { OrderStatusEnum } from "@bigtix/common";

export interface SavedTicketDoc {
  id: string;
  orderId: string | null;
  title: string;
  description?: string;
  price: number;
  version: number;
}

export type ListingType = {
  id: string;
  title: string;
  description?: string;
  price: number;
  order: { id: string; status: OrderStatusEnum; expiresAt: Date } | null;
};

export type OrderWithTicketsType = {
  id: string;
  status: OrderStatusEnum;
  expiresAt: Date;
  userId: string;
  tickets: SavedTicketDoc[];
  version: number;
};
