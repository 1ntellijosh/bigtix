/**
 * Holds helper functions for testing middleware
 *
 * @since tests-start--JP
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

/**
 * For testing, creates a signed in user cookie
 *
 * @param {string} generatedMongoId  The generated MongoDB ID for the user
 * - created using: new mongoose.Types.ObjectId().toString()
 *
 * @returns {string}  The signed in user cookie
 */
export function createSignedInUserCookie(generatedMongoId: string): string[] {
  // build a jwt with the given payload
  const payload = {
    id: generatedMongoId,
    email: 'someguy@someemail.com',
    iat: Date.now()
  }

  // Create the jwt
  const userJwt = jwt.sign(payload, process.env.JWT_KEY!);

  // build a session object with the jwt
  const session = { jwt: userJwt };

  // serialize the session object
  const sessionSerialized = JSON.stringify(session);

  // encode the session serialized object as base64
  const base64 = Buffer.from(sessionSerialized).toString('base64');

  // return the cookie string (in an array for supertest)
  return [`session=${base64}`];
}
