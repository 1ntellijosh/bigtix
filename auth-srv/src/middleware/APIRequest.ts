import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationError } from './errors/RequestValidationError';

/**
 * API request middleware helper class. Wraps an api function in a try/catch block and returns a function that can be
 * used in an express route. If error is thrown, it is passed to the next middleware (ErrorHandler will handle it)
 *
 * @since users-service-continued--JP
 */
export class APIRequest {
  /**
   * Calls given api function in a try/catch block and returns a function that can be used in an express route
   *
   * @param {Function} fn  The api function to wrap/call
   *
   * @returns {Function}  The wrapped api function
   */
  static call(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
      this.validateRequest(req);
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validates request using express-validator
   *
   * @param req  The request to validate
   *
   * @returns {void}
   *
   * @throws {RequestValidationError}  If request validation fails
   */
  static validateRequest(req: Request) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationError('Request validation failed', errors.array())
    }
  }
}
