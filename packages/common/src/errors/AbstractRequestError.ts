/**
 * Abstract base class for all request errors. Has status code and genResponseErrItemsList method
 *
 * @since users-service-continued--JP
 */
import { STATUS_CODES } from '../enums';
import { ErrorResponseItem } from '../types';

export abstract class AbstractRequestError extends Error {
  abstract statusCode: STATUS_CODES;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AbstractRequestError.prototype);
  }

  /**
   * Gets errors array list for 'errors' list in error-responses
   * - Overridden by Error subclasses
   *
   * @returns {ErrorResponseItem[]}
   */
  abstract genResponseErrItemsList(): ErrorResponseItem[]
}
