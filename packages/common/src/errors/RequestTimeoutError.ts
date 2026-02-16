/**
 * Error class for all request errors that fail to execute because the request timed out
 *
 * @since users-service-continued--JP
 */
import { STATUS_CODES } from '../enums';
import { ErrorResponseItem } from '../contracts';
import { AbstractRequestError } from "./AbstractRequestError";

export class RequestTimeoutError extends AbstractRequestError {
  public readonly statusCode: STATUS_CODES = STATUS_CODES.REQUEST_TIMEOUT;
  public readonly name: string;

  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'RequestTimeoutError';
    Object.setPrototypeOf(this, RequestTimeoutError.prototype);
  }

  /**
   * Gets errors array list for 'errors' list in error-responses
   *
   * @returns {ErrorResponseItem[]}
   */
  genResponseErrItemsList(): ErrorResponseItem[] {
    const error: ErrorResponseItem = { message: this.message };
    return [ error ];
  }
}
