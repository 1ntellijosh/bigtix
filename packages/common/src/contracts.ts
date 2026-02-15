/**
 * Shared types for BigTix platform (client + server)
 *
 * @since next-client--JP
 */

/**
 * Type for express-validator validation error items
 * so we can re-use in @bigtix/common without importing express-validator
 */
export interface ExpressValidationErrorItem {
  msg: string;
  type: string;
  path?: string;
  location?: string;
}

export interface ErrorResponseItem {
  field?: string;
  message: string;
}

export interface ErrorResponse {
  message?: string;
  errors: ErrorResponseItem[];
}

/**
 * Event Details structure contracts
 *
 * @since ticketmaster-api--JP
 */
export interface TicketMasterImage {
  ratio: string;
  url: string;
  width: number;
  height: number;
  fallback: boolean;
}

export interface SearchedEvent {
  name: string;
  id: string;
  location: string;
  date: Date | null;
  image: TicketMasterImage | null;
  description: string;
  dateSegments: { month: string; day: string; weekday: string } | null;
}

export interface EventDetails {
  name: string;
  id: string;
  location: string;
  date: Date | null;
  image: TicketMasterImage | null;
  attractions: { name: string; externalLinks: Record<string, string>, classifications: string[] }[];
  description: string;
  dateSegments: { month: string; day: string; weekday: string } | null;
}