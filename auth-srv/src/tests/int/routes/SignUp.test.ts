/**
 * Tests for SignUp route
 *
 * @since tests-start--JP
 */
import request from 'supertest';
import { authApp } from '../../../App';

const validEmail = 'someguy@someemail.com';
const validPassword = 'Password1';

describe('Sign up route tests', () => {
  it('Returns a 201 with valid email and password', async () => {
    return request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(201);
  });

  it('Returns a 400 for email with no domain extension', async () => {
    return request(authApp)
      .post('/api/users/signup')
      .send({
        email: 'someguy@someemail',
        password: validPassword,
      })
      .expect(400);
  });

  it('Returns a 400 for email with no @ symbol', async () => {
    return request(authApp)
      .post('/api/users/signup')
      .send({
        email: 'someguysomeemail.com',
        password: validPassword,
      })
      .expect(400);
  });

  it('Returns a 400 for password that is too short', async () => {
    return request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: 'Passwor',
      })
      .expect(400);
  });

  it('Returns a 400 for password that is too long', async () => {
    return request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: 'Password123456789012345678901234567890',
      })
      .expect(400);
  });

  it('Returns a 400 for password that has no number', async () => {
    return request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: 'Password',
      })
      .expect(400);
  });

  it('Returns a 400 for password that has no capital letter', async () => {
    return request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: 'password1',
      })
      .expect(400);
  });

  it('Returns a 400 for password that has no lowercase letter', async () => {
    return request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: 'PASSWORD1',
      })
      .expect(400);
  });

  it('Does not allow duplicate emails', async () => {
    await request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(201);
    
    return request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(400);
  });

  it('Sets a cookie after successful signup', async () => {
    const response = await request(authApp)
      .post('/api/users/signup')
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
