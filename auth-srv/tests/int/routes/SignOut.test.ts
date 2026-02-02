/**
 * Tests for SignOut route
 *
 * @since tests-start--JP
 */
import request from 'supertest';
import { authApp } from '../../../src/App';

const validEmail = 'someguy@someemail.com';
const validPassword = 'Password1';

describe('Sign out route tests', () => {
  it('Cookie is cleared after successful signout', async () => {
    await request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(201);

    const signoutResponse = await request(authApp)
      .post('/api/users/signout')
      .send({})
      .expect(200);

    const signoutCookie = signoutResponse.get('Set-Cookie');
    let sessionString = Array.isArray(signoutCookie)
      ? signoutCookie[0].split(';')[0].split('=')[1]
      : null;

    expect(sessionString).toBeFalsy();
  });
});
