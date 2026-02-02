/**
 * Tests for CurrentUser route
 *
 * @since tests-start--JP
 */
import request from 'supertest';
import { authApp } from '../../../App';

const validEmail = 'someguy@someemail.com';
const validPassword = 'Password1';

describe('Current user route tests', () => {
  it('Responds with details about the current user', async () => {
    const signupResponse = await request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(201);
    const cookie = signupResponse.get('Set-Cookie');
    if (!cookie) {
      throw new Error('Cookie not found');
    }

    const response = await request(authApp)
      .get('/api/users/currentuser')
      .set('Cookie', cookie[0])
      .expect(200);

    expect(response.body.currentUser.email).toEqual(validEmail);
  });

  it('Responds with null if not authenticated', async () => {
    const response = await request(authApp)
      .get('/api/users/currentuser')
      .expect(200);

    expect(response.body.currentUser).toBeNull();
  });
});
