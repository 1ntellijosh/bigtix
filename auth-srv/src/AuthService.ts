/**
 * Class for Auth Service business logic
 *
 * @since users-service-continued--JP
 */
import { UserRepository } from './repositories/UserRepository';
import { SavedUserDoc } from './models/User';
import { BadRequestError } from '@bigtix/common';
import { PasswordService as passSvc } from '@bigtix/middleware';
import { Request } from 'express';
import { SessionModule } from './modules/SessionModule';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  /**
   * Signs up a new user with given email and password
   *
   * @param {string} email
   * @param {string} password
   *
   * @returns {Promise<SavedUserDoc>}
   * 
   * @throws {BadRequestError}  If email is already in use
   */
  async createAndSignInUser(req: Request, email: string, password: string): Promise<SavedUserDoc> {
    // If the user already exists, throw an error
    const savedUser = await this.userRepo.findByEmail(email);
    if (savedUser) throw new BadRequestError('Email already in use');

    // Create the user
    const user = await this.userRepo.create({ email, password });

    // Sign in the user
    SessionModule.setJwtInUserSession(req, user);

    return user;
  }

  /**
   * Signs in a user with given email and password
   *
   * @param {string} email
   * @param {string} password
   *
   * @returns {Promise<SavedUserDoc>}
   */
  async signIn(req: Request, email: string, password: string): Promise<SavedUserDoc> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new BadRequestError('Email not found');

    const passwordsMatch = await passSvc.verifyPassword(user.password, password);
    
    if (!passwordsMatch) throw new BadRequestError('Password is incorrect');

    SessionModule.setJwtInUserSession(req, user);

    return user;
  }

  /**
   * Gets the current user data from the jwt in session (if present)
   *
   * @param {Request} req
   *
   * @returns {object | null}  The current user data
   */
  getCurrentUser(req: Request): { currentUser: SavedUserDoc | null } {
    try {
      const payload = SessionModule.extractPayloadFromJwt(req);
  
      return { currentUser: payload as SavedUserDoc | null };
    } catch (err) {
      return { currentUser: null };
    }
  }
}
