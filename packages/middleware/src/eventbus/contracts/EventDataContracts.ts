/**
 * Microservice event data contracts. Used so factories know the format of each event data payload, and so event
 * consumers can type-check against and read the data payload.
 *
 * @since event-bus-start--JP
 */

/********************************************
 * AUTHORIZATION SERVICE EVENT DATA CONTRACTS
 ********************************************/

/** Data payload for user.created / user.signedin / user.signedout / user.updated. */
export interface UserIdentityData {
  userId: string;
  email: string;
}

/** Data payload for user.deleted. */
export interface UserDeletedData {
  userId: string;
}

/** Data payload for user.deactivated. / user.reactivated. */
export interface UserActivationStatusData {
  userId: string;
  isActive: boolean;
}

/*******************************************
 * TICKETING SERVICE EVENT DATA CONTRACTS
 *******************************************/

/** Data payload for ticket.created. */
export interface TicketCreatedData {
  ticketId: string;
  eventId: string;
  userId: string;
  price: number;
  description: string;
  serialNumber: string;
  title: string;
}

/** Data payload for ticket.updated. */
export interface TicketUpdatedData {
  ticketId: string;
  price: number;
  description: string;
  title: string;
}

/** Data payload for ticket.deleted. / ticket.sold. / ticket.cancelled. / ticket.refunded. */
export interface TicketDeletedData {
  ticketId: string;
}
