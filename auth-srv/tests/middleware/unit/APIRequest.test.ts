/**
 * Tests for APIRequest middleware
 *
 * @since tests-start--JP
 */
import { APIRequest, UserJwtPayload } from '../../../src/middleware/APIRequest';
import { createMockRequestVars } from './MiddlewareUnitTestHelpers';
import { validationResult, ValidationError } from 'express-validator';
import { RequestValidationError } from '../../../src/middleware/errors/RequestValidationError';
import { UnAuthorizedError } from '../../../src/middleware/errors/UnauthorizedError';
import jwt from 'jsonwebtoken';

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

const mockValidationErrors: ValidationError[] = [
  { msg: 'test error', type: 'field', path: 'body', location: 'body' } as ValidationError,
];

const reqBody = { email: 'someguy@someemail.com', password: 'password' };

describe('APIRequest', () => {
  it('should call the given async function', () => {
    const fn = jest.fn();
    const { req, res, next } = createMockRequestVars();
    req.body = reqBody;

    APIRequest.callAsync(fn)(req, res, next);
    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  it('should call the next function if the request is valid', () => {
    const { req, res, next } = createMockRequestVars();
    req.body = reqBody;
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });

    APIRequest.validateRequest(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should throw a RequestValidationError if the request is invalid', () => {
    const { req, res, next } = createMockRequestVars();
    req.body = reqBody;
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => false,
      array: () => mockValidationErrors,
    });

    expect(() => APIRequest.validateRequest(req, res, next)).toThrow(RequestValidationError);
  });

  it('should skip token verification and call the next function if the user is not authenticated', () => {
    const { req, res, next } = createMockRequestVars();
    req.body = reqBody;
    req.session = null;
    // (jwt.verify as unknown as jest.Mock).mockReturnValue({ id: '123', email: 'someguy@someemail.com' });
    const verifySpy = jest.spyOn(jwt, 'verify');

    APIRequest.getCurrentUser(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(verifySpy).not.toHaveBeenCalled();
    verifySpy.mockRestore();
  });

  it('should verify the token and current user jwt if the user is authenticated', () => {
    const { req, res, next } = createMockRequestVars();
    req.body = reqBody;
    req.session = { jwt: jwt.sign({ id: '123', email: 'someguy@someemail.com' }, process.env.JWT_KEY!) };
    const verifySpy = jest.spyOn(jwt, 'verify');
    APIRequest.getCurrentUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(verifySpy).toHaveBeenCalled();
    verifySpy.mockRestore();
  });

  it('should throw an UnAuthorizedError if the user is not authenticated', () => {
    const { req, res, next } = createMockRequestVars();

    expect(() => APIRequest.authIsRequired(req, res, next)).toThrow(UnAuthorizedError);
  });

  it('should call the next function if the user is authenticated', () => {
    const { req, res, next } = createMockRequestVars();
    req.currentUser = { id: '123', email: 'someguy@someemail.com', iat: Date.now() } as UserJwtPayload;

    APIRequest.authIsRequired(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

