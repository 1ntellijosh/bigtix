/**
 * Tests for ErrorHandler middleware
 *
 * @since tests-start--JP
 */
import { jest } from '@jest/globals';
import { ErrorHandler } from '@bigtix/middleware';
import { ValidationError } from 'express-validator';
import { ServerError } from '@bigtix/common';
import { RequestValidationError } from '@bigtix/common';
import { NotFoundError } from '@bigtix/common';
import { createMockRequestVars } from '@bigtix/middleware';

describe('ErrorHandler', () => {
  it('returns a 500 error for a generic error', () => {
    const error = new Error('test error');
    const { req, res, next } = createMockRequestVars();
    const respStatusSpy = jest.spyOn(res, 'status');
    const respJsonSpy = jest.spyOn(res, 'json');
    const respEndSpy = jest.spyOn(res, 'end');

    ErrorHandler.prepareErrResp(error, req, res, next);
    expect(respStatusSpy).toHaveBeenCalledWith(500);
    expect(respJsonSpy).toHaveBeenCalledWith({ errors: [{ message: error.message }] });
    expect(respEndSpy).toHaveBeenCalled();
    respStatusSpy.mockRestore();
    respJsonSpy.mockRestore();
    respEndSpy.mockRestore();
  });

  it('logs and handles a non user 5xx error', () => {
    const error = new ServerError('test error');
    const { req, res, next } = createMockRequestVars();
    const logHandlerSpy = jest.spyOn(ErrorHandler, 'logAndHandle5xxError');

    ErrorHandler.prepareErrResp(error, req, res, next);
    expect(logHandlerSpy).toHaveBeenCalledWith(error, req, res, next);
    logHandlerSpy.mockRestore();
  });

  it('returns a 400 error for a RequestValidationError', () => {
    const error = new RequestValidationError('test error', [
      { msg: 'test error', type: 'field', path: 'body', location: 'body' } as ValidationError
    ] as ValidationError[]);
    const genErrItemsSpy = jest.spyOn(error, 'genResponseErrItemsList');
    const { req, res, next } = createMockRequestVars();
    const respStatusSpy = jest.spyOn(res, 'status');
    const respJsonSpy = jest.spyOn(res, 'json');
    const respEndSpy = jest.spyOn(res, 'end');

    ErrorHandler.prepareErrResp(error, req, res, next);
    expect(respStatusSpy).toHaveBeenCalledWith(400);
    expect(respJsonSpy).toHaveBeenCalledWith({ errors: [{ message: error.message, field: 'body' }] });
    expect(respEndSpy).toHaveBeenCalled();
    expect(genErrItemsSpy).toHaveBeenCalled();
    genErrItemsSpy.mockRestore();
    respStatusSpy.mockRestore();
    respJsonSpy.mockRestore();
    respEndSpy.mockRestore();
  });

  it('returns a 404 error for a RequestValidationError', () => {
    const error = new NotFoundError('Not found');
    const { req, res, next } = createMockRequestVars();
    const genErrItemsSpy = jest.spyOn(error, 'genResponseErrItemsList');
    const respStatusSpy = jest.spyOn(res, 'status');
    const respJsonSpy = jest.spyOn(res, 'json');
    const respEndSpy = jest.spyOn(res, 'end');

    ErrorHandler.prepareErrResp(error, req, res, next);
    expect(genErrItemsSpy).toHaveBeenCalled();
    expect(respStatusSpy).toHaveBeenCalledWith(404);
    expect(respJsonSpy).toHaveBeenCalledWith({ errors: [{ message: 'Not found' }] });
    expect(respEndSpy).toHaveBeenCalled();
    genErrItemsSpy.mockRestore();
    respStatusSpy.mockRestore();
    respJsonSpy.mockRestore();
    respEndSpy.mockRestore();
  });
});
