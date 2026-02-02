/**
 * Library of API helper functions/assets
 * TODO: Add this to node_modules library when this is added to project
 *
 * @since users-service-continued--JP
 */
import { body } from 'express-validator';

/**
 * API validation helper class
 *
 * @since users-service-continued--JP
 */
export class APIValidation {
  /**
   * Validates given email string
   *
   * @param {string} email  The email in body field to validate
   *
   * @returns {ValidationChain}
   */
  static emailInBody(emailField: string) {
    return body(emailField).isEmail().withMessage('Invalid email');
  }

  /**
   * Validates given password string (for new users signing up)
   *
   * @param {string} passwordField  The password in body field to validate
   *
   * @returns {ValidationChain}
   */
  static newPassword(passwordField: string) {
    return body(passwordField)
      .trim()
      .isLength({ min: 8 }).matches(/\d/).withMessage('Password must be at least 8 characters long and contain at least one number')
      .matches('[A-Z]').withMessage('Password must contain at least one capital letter')
      .matches('[a-z]').withMessage('Password must contain at least one lowercase letter')
      .matches('[0-9]').withMessage('Password must contain at least one number')
  }

  /**
   * Validates given password string (for existing users)
   *
   * @param {string} passwordField  The password in body field to validate
   *
   * @returns {ValidationChain}
   */
  static currentPassword(passwordField: string) {
    return body(passwordField).trim().notEmpty().withMessage('Password is required');
  }
}
