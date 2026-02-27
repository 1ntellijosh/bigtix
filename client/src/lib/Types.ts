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

export interface TicketWithEvent extends SavedTicketDoc {
  event: SavedEventDoc;
} 

export interface SavedEventDoc {
  id: string;
  tmEventId: string;
  title: string;
  date: Date;
  location: string;
  attractions: string;
  image: string | null;
}

export interface SavedOrderDoc {
  id: string;
  userId: string;
  expiresAt: Date | null;
  status: OrderStatusEnum;
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
