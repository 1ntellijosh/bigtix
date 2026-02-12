/**
 * Session module for auth-srv
 *
 * @since service-clean--JP
 */
import { PasswordService as passSvc, UserJwtPayload } from '@bigtix/middleware';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { SavedUserDoc } from '../models/User';

export class SessionModule {
  /**
   * Sets the JWT in the user's session
   *
   * @param {Request} req
   * @param {SavedUserDoc} user
   */
  static setJwtInUserSession(req: Request, user: SavedUserDoc) {
    const userJwt = jwt.sign({
      id: user.id,
      email: user.email,
    }, process.env.JWT_KEY!);
    req.session = { jwt: userJwt };
  }

  static extractPayloadFromJwt(req: Request): UserJwtPayload | null {
    if (!('session' in req) || !req.session?.jwt) {
      return null;
    }

    return jwt.verify(req.session.jwt, process.env.JWT_KEY!) as unknown as UserJwtPayload;
  }
}
