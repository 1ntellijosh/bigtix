/**
 * Error with HTTP status for the central handler to use in api routes for call validation errors
 *
 * @since users-service-continued--JP
 */
import { STATUS_CODES } from '../enums';
import { ErrorResponseItem } from '../contracts';
import { AbstractRequestError } from "./AbstractRequestError";

export class APIError extends AbstractRequestError {
  public readonly errors: ErrorResponseItem[];
  public readonly name: string;
  public readonly statusCode: STATUS_CODES;

  constructor(
    message: string,
    statusCode: STATUS_CODES,
    errors: ErrorResponseItem[],
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, APIError.prototype);
  }

  /**
   * Gets errors array list for 'errors' list in error-responses
   *
   * @returns {ErrorResponseItem[]}
   */
  genResponseErrItemsList(): ErrorResponseItem[] {
    return this.errors;
  }
}
