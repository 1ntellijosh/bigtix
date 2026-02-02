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