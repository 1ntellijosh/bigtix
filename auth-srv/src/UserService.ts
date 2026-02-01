/**
 * Class for Auth Service business logic
 *
 * @since users-service-continued--JP
 */
import { UserRepository } from './repositories/UserRepository';
import { SavedUserDoc } from './models/User';
import { BadRequestError } from './middleware/errors/BadRequestError';
import { Password } from './middleware/Password';
import jwt from 'jsonwebtoken';
import { Request } from 'express';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  /**
   * Finds a user by given email
   *
   * @param {string} email
   *
   * @returns {Promise<SavedUserDoc | null>}
   */
  async findUserByEmail(email: string): Promise<SavedUserDoc | null> {
    return this.userRepo.findByEmail(email);
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
    const savedUser = await this.findUserByEmail(email);
    if (savedUser) throw new BadRequestError('Email already in use');

    // Create the user
    const user = await this.userRepo.create({ email, password });

    // Sign in the user
    await this.signIn(req, email, password);

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

    const passwordsMatch = await Password.verifyPassword(user.password, password);
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
    }, 'key'!);
    req.session = { jwt: userJwt };
  }
}
