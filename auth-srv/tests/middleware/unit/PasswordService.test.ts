/**
 * Tests for PasswordService middleware
 *
 * @since tests-start--JP
 */
import { PasswordService } from '@bigtix/middleware';

describe('PasswordService', () => {
  it('returns a hashed password', async () => {
    const password = 'password';
    const hashedPassword = await PasswordService.toHash(password);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword !== password).toBeTruthy();
  });

  it('returns a hashed password with a salt', async () => {
    const password = 'password';
    const hashedPassword = await PasswordService.toHash(password);
    const [hashedPasswordPart, salt] = hashedPassword.split('.');

    expect(hashedPasswordPart).toBeDefined();
    expect(salt).toBeDefined();
    expect(hashedPasswordPart !== password).toBeTruthy();
  });

  it('returns true if the password is correct', async () => {
    const password = 'password';
    const hashedPassword = await PasswordService.toHash(password);
    const isCorrect = await PasswordService.verifyPassword(hashedPassword, password);
    expect(isCorrect).toBeTruthy();
  });

  it('returns false if the password is incorrect', async () => {
    const password = 'password';
    const hashedPassword = await PasswordService.toHash(password);
    const isCorrect = await PasswordService.verifyPassword(hashedPassword, 'wrongpassword');
    expect(isCorrect).toBeFalsy();
  });
});
