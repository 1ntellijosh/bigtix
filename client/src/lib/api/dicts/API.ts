/**
 * API dictionary that hold all the API definitions for all the microservices in the platform
 * 
 * @since next-client--JP
 */
import { AuthAPIs } from './AuthAPIs';
import { TicketsAPIs } from './TicketsAPIs';

export const API: { [key: string]: { [key: string]: (...args: any[]) => Promise<Response> } } = {
  auth: AuthAPIs,
  tick: TicketsAPIs,
};
