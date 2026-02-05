/**
 * Error class for all request errors that fail to execute because the user is does not have permission for request
 *
 * @since users-service-continued--JP
 */
import { STATUS_CODES } from '../enums';
import { ErrorResponseItem } from '../types';
import { AbstractRequestError } from "./AbstractRequestError";

export class ForbiddenError extends AbstractRequestError {
  public readonly statusCode: STATUS_CODES = STATUS_CODES.FORBIDDEN;
  public readonly name: string;

  constructor(message: string = 'Permission denied') {
    super(message);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
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
