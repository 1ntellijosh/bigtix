/**
 * Error class for all request errors that fail to execute because of network issues
 *
 * @since next-client--JP
 */
import { STATUS_CODES } from '../enums';
import { ErrorResponseItem } from '../contracts';
import { AbstractRequestError } from "./AbstractRequestError";

export class NetworkError extends AbstractRequestError {
  public readonly statusCode: STATUS_CODES = STATUS_CODES.NO_RESPONSE;
  public readonly name: string;

  constructor(message: string = 'Error connecting to server. Please check your connection or try again later.') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
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
