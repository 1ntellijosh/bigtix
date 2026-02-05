/**
 * API dictionary for calls to the authentication microservice
 * 
 * @since next-client--JP
 */
import { HttpService } from '../HttpService';

export const AuthAPIs: { [key: string]: (body?: any, config?: Record<string, any>) => Promise<Response> } = {
  /**
   * Signs up a new user
   *
   * @param {object} body  The body of the request
   *   @prop {string} email  The email of the user
   *   @prop {string} password  The password of the user
   *   @prop {Record<string, any>} config  The config for the request
   *
   * @returns {Promise<Response>}
   */
  signUpUser: function (body: { email: string; password: string }, config: Record<string, any> = {}): Promise<Response> {
    return HttpService.post('/api/users/signup', body, config) as Promise<Response>;
  },

  /**
   * Signs in a user
   *
   * @param {object} body  The body of the request
   *   @prop {string} email  The email of the user
   *   @prop {string} password  The password of the user
   *   @prop {Record<string, any>} config  The config for the request
   *
   * @returns {Promise<Response>}
   */
  signInUser: function (body: { email: string; password: string }, config: Record<string, any> = {}): Promise<Response> {
    return HttpService.post('/api/users/signin', body, config) as Promise<Response>;
  },

  /**
   * Gets the current user data from the jwt in session (to see if user is logged in)
   * 
   * @param {Record<string, any>} config  The config for the request
   *
   * @returns {Promise<Response>}
   */
  getCurrentUser: function (config: Record<string, any> = {}): Promise<Response> {
    return HttpService.get('/api/users/currentuser', config);
  },

  /**
   * Signs out the current user
   *
   * @param {Record<string, any>} config  The config for the request
   *
   * @returns {Promise<Response>}
   */
  signOutUser: function (config: Record<string, any> = {}): Promise<Response> {
    return HttpService.post('/api/users/signout', config);
  },
};
