/**
 * Class for Auth Service business logic
 *
 * @since users-service-continued--JP
 */
import { UserRepository } from './repositories/UserRepository';
import { SavedUserDoc } from './models/User';
import { BadRequestError } from './middleware/errors/BadRequestError';
import { PasswordService as passSvc } from './middleware/PasswordService';
import jwt from 'jsonwebtoken';
import { Request } from 'express';

export class UserService {
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
    this.setJwtInUserSession(req, user);

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
    if (!user) throw new BadRequestError('Invalid credentials');

    const passwordsMatch = await passSvc.verifyPassword(user.password, password);
    if (!passwordsMatch) throw new BadRequestError('Invalid credentials');

    this.setJwtInUserSession(req, user);

    return user;
  }

  /**
   * Sets the JWT in the user's session
   *
   * @param {Request} req
   * @param {SavedUserDoc} user
   */
  setJwtInUserSession(req: Request, user: SavedUserDoc) {
    const userJwt = jwt.sign({
      id: user.id,
      email: user.email,
    }, process.env.JWT_KEY!);
    req.session = { jwt: userJwt };
  }

  /**
   * Gets the current user data from the jwt in session (if present)
   *
   * @param {Request} req
   *
   * @returns {object | null}  The current user data
   */
  getCurrentUser(req: Request): { currentUser: SavedUserDoc | null } {
    if (!('session' in req) || !req.session?.jwt) {
      return { currentUser: null };
    }
  
    try {
      const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
  
      return { currentUser: payload as SavedUserDoc | null };
    } catch (err) {
      return { currentUser: null };
    }
  }
}
