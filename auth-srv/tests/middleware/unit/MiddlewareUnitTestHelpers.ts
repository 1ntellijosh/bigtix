/**
 * Holds helper functions for testing middleware
 *
 * @since tests-start--JP
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Creates mock request variables
 *
 * @returns {Request, Response, NextFunction}
 */
export function createMockRequestVars(): { req: Request; res: Response; next: NextFunction } {
  return {
    req: {
      body: {},
    } as unknown as Request,
    res: {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis()
    } as unknown as Response,
    next: jest.fn() as unknown as NextFunction
  }
};

