/**
 * Tests for SignIn route
 *
 * @since tests-start--JP
 */
import request from 'supertest';
import { authApp } from '../../../App';

const validEmail = 'someguy@someemail.com';
const validPassword = 'Password1';

describe('Sign in route tests', () => {
  it('Returns a 200 with valid registered email and password', async () => {
    await request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(201);

    return request(authApp)
      .post('/api/users/signin')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(200);
  });

  it('Returns a 400 with an invalid password', async () => {
    await request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(201);

    return request(authApp)
      .post('/api/users/signin')
      .send({
        email: validEmail,
        password: 'invpass',
      })
      .expect(400);
  });

  it('Returns a 400 with an unregistered email', async () => {
    return request(authApp)
      .post('/api/users/signin')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(400);
  });

  it('Sets a cookie after successful signin', async () => {
    await request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(201);

    const response = await request(authApp)
      .post('/api/users/signin')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});