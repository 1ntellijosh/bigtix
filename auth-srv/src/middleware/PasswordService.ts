import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class PasswordService {
  /**
   * Hash the given password, and return the hashed password and salt concatenated by a dot
   * @param {string} password
   * 
   * @returns {Promise<string>}
   */
  static async toHash(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const buf = await scryptAsync(password, salt, 64) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  /**
   * Checks to see if the supplied password matches the stored password
   *
   * @param {string} storedPassword 
   * @param {string} suppliedPassword 
   *
   * @returns {Promise<boolean>}
   */
  static async verifyPassword(storedPassword: string, suppliedPassword: string): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = await scryptAsync(suppliedPassword, salt, 64) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }
}
