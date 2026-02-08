/**
 * API service for making API calls (with axios)
 * 
 * @since next-client--JP
 */
import { STATUS_CODES } from '@bigtix/common';
import { APIError } from '@bigtix/common';
import axios from 'axios';

/** Server-side base URL (e.g. ingress in cluster). Set via env in the pod, not build. */
const SERVER_API_BASE = process.env.SERVER_API_BASE_URL ?? 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local';

export class HttpService {
  /**
   * Makes a GET (read) request
   *
   * @param {string}  url 
   * @param {Record<string, any>}  config 
   * 
   * @returns {Promise<Response>}  The response from the request
   * 
   * @throws {TypeError}
   */
  static get = (
    url: string,
    config: Record<string, any> = {},
  ): Promise<Response> => {
    return this.call('get', url, [config]);
  }

  /**
   * Makes a POST (create) request
   *
   * @param {string}  url 
   * @param {any}  body 
   * @param {Record<string, any>}  config 
   * 
   * @returns {Promise<Response>}  The response from the request
   * 
   * @throws {TypeError}
   */
  static post = (
    url: string,
    body: any,
    config: Record<string, any> = {},
  ): Promise<Response> => {
    return this.call('post', url, [body, config]);
  }

  /**
   * Makes a PUT (replace) request
   *
   * @param {string}  url 
   * @param {any}  body 
   * @param {Record<string, any>}  config 
   * 
   * @returns {Promise<Response>}
   */
  static put = (
    url: string,
    body: any,
    config: Record<string, any> = {},
  ): Promise<Response> => {
    return this.call('put', url, [body, config]);
  }

  /**
   * Makes a PATCH (update) request
   *
   * @param {string}  url 
   * @param {any}  body 
   * @param {Record<string, any>}  config 
   * 
   * @returns {Promise<Response>}
   */
  static patch = (
    url: string,
    body: any,
    config: Record<string, any> = {},
  ): Promise<Response> => {
    return this.call('patch', url, [body, config]);
  }

  /**
   * Makes a DELETE (delete) request
   *
   * @param {string}  url 
   * @param {'include' | 'omit'}  credentials 
   * @param {{[key: string]: string}}  headers
   * 
   * @returns {Promise<Response>}
   */
  static delete = (
    url: string,
    config: Record<string, any> = {},
  ): Promise<Response> => {
    return this.call('delete', url, [config]);
  }

  /**
   * Prepares and calls the API
   *
   * @param {Function}  apiCall  The API call function to call
   * @param {any[]}  args  The arguments to pass to the API call function
   *
   * @returns {Promise<any>}  Parsed JSON response, or null for empty responses (204, etc.)
   */
  static call = async (
    apiMethod: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, args: any[] = []): Promise<any> => {
    try {
      const response = await axios[apiMethod](this.updateUrlForServerSide(url), ...args);
      
      return response.data;
    } catch (error: any) {
      return this.throwFailedCallError(error as any);
    }
  }

  /**
   * Handles failed requests by throwing the appropriate error according to the status code.
   * Reads the response body (ReadableStream) via .json() so server error details can be used.
   *
   * @param {Response} errResp  The response from the failed request
   *
   * @throws {AbstractRequestError}
   */
  static throwFailedCallError = async (err: any): Promise<never> => {
    if (err.response) {
      /**
       * The request was made and the server responded with a status code
       * that falls out of the range of 2xx
       */
      const data = err.response.data;
      const status = err.response.status;
      let message = 'Request failed. Please try again.';
      switch (status) {
        case STATUS_CODES.BAD_REQUEST:
          message = data.message ?? message;
          break;
        case STATUS_CODES.UNAUTHORIZED:
          message = 'Not logged in';
          break;
        case STATUS_CODES.FORBIDDEN:
          message = 'Forbidden';
          break;
        case STATUS_CODES.NOT_FOUND:
          message = data.message ?? message;
          break;
        case STATUS_CODES.REQUEST_TIMEOUT:
          message = 'Request timeout';
          break;
        default:
          if (err.status >= 400 && err.status < 500) 'Request failed.';
          else message = 'Request failed.';
      }

      throw new APIError(message, err.status, data.errors);
    }
    
    if (err.request) {
      /**
       * The request was made but no response was received. Could be local client network issue.
       */
      throw new APIError(
        'Error connecting to server. Please check your connection or try again later.',
        STATUS_CODES.NO_RESPONSE,
        [{ message: 'Error connecting to server. Please check your connection or try again later.' }]
      );
    }
    
    /**
     * Something happened in setting up the request that triggered an Error
     * TODO: Need to log this occurance here as it is in local code, not server code.
     */
    throw new APIError('Something went wrong', STATUS_CODES.INTERNAL_SERVER_ERROR, [{ message: err.message }]);
  }

  /**
   * Returns true if the code is running on the server instead of the client. This is useful for API calls that need to
   * be made on the server side in React components'getInitialProps lifecycle method.
   *
   * @returns {boolean}  True if the code is running on the server, false otherwise
   */
  private static isOnServer = () => {
    return typeof window === 'undefined';
  }

  /**
   * Updates the URL for a server-side API call
   *
   * @param {string} url  The URL to update
   *
   * @returns {string}  The updated URL
   */
  private static updateUrlForServerSide = (url: string): string => {
    const baseUrl = this.isOnServer()
      ? `${SERVER_API_BASE.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`
      : url;

    return baseUrl;
  }
}
