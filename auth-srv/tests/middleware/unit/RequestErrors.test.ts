/**
 * Tests for RequestErrors middleware
 *
 * @since tests-start--JP
 */
import { ValidationError } from 'express-validator';
import { ServerError } from '../../../src/middleware/errors/ServerError';
import { RequestValidationError } from '../../../src/middleware/errors/RequestValidationError';
import { NotFoundError } from '../../../src/middleware/errors/NotFoundError';
import { BadRequestError } from '../../../src/middleware/errors/BadRequestError';
import { UnAuthorizedError } from '../../../src/middleware/errors/UnauthorizedError';
import { DatabaseConnectionError } from '../../../src/middleware/errors/DatabaseConnectionError';
import { AbstractRequestError } from '../../../src/middleware/errors/AbstractRequestError';

describe('RequestError', () => {
  it('should create a RequestValidationError with correct fields', () => {
    const error = new RequestValidationError('test error', [
      { msg: 'test error', type: 'field', path: 'body', location: 'body' } as ValidationError
    ] as ValidationError[]);
    expect(error).toBeInstanceOf(AbstractRequestError);
    expect(error.message).toBe('test error');
    expect(error.reasons).toEqual([
      { msg: 'test error', type: 'field', path: 'body', location: 'body' } as ValidationError
    ]);
    expect(error.name).toBe('RequestValidationError');
    expect(error.statusCode).toBe(400);
    expect(error.genResponseErrItemsList()).toEqual([
      { message: 'test error', field: 'body' }
    ]);
  });

  it('should create a ServerError with correct fields', () => {
    const error = new ServerError('test error');
    expect(error).toBeInstanceOf(AbstractRequestError);
    expect(error.message).toBe('test error');
    expect(error.name).toBe('ServerError');
    expect(error.statusCode).toBe(500);
    expect(error.genResponseErrItemsList()).toEqual([
      { message: 'test error' }
    ]);
  });

  it('should create a NotFoundError with correct fields', () => {
    const error = new NotFoundError('Not found');
    expect(error).toBeInstanceOf(AbstractRequestError);
    expect(error.message).toBe('Not found');
    expect(error.name).toBe('NotFoundError');
    expect(error.statusCode).toBe(404);
    expect(error.genResponseErrItemsList()).toEqual([
      { message: 'Not found' }
    ]);
  });

  it('should create a BadRequestError with correct fields', () => {
    const error = new BadRequestError('Bad request');
    expect(error).toBeInstanceOf(AbstractRequestError);
    expect(error.message).toBe('Bad request');
    expect(error.name).toBe('BadRequestError');
    expect(error.statusCode).toBe(400);
    expect(error.genResponseErrItemsList()).toEqual([
      { message: 'Bad request' }
    ]);
  });

  it('should create a UnAuthorizedError with correct fields', () => {
    const error = new UnAuthorizedError('Unauthorized');
    expect(error).toBeInstanceOf(AbstractRequestError);
    expect(error.message).toBe('Unauthorized');
    expect(error.name).toBe('UnAuthorizedError');
    expect(error.statusCode).toBe(401);
    expect(error.genResponseErrItemsList()).toEqual([
      { message: 'Not logged in' }
    ]);
  });

  it('should create a DatabaseConnectionError with correct fields', () => {
    const error = new DatabaseConnectionError('Failed to connect to database');
    expect(error).toBeInstanceOf(AbstractRequestError);
    expect(error.message).toBe('Failed to connect to database');
    expect(error.name).toBe('DatabaseConnectionError');
    expect(error.statusCode).toBe(500);
    expect(error.genResponseErrItemsList()).toEqual([
      { message: 'Failed to connect to database' }
    ]);
  });
});
