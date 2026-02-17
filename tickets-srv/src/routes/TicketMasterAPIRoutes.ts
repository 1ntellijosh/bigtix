/**
 * TicketMaster API routes for tickets-srv
 *
 * @since ticketmaster-api--JP
 */
import express, { Request, Response } from "express";
import { APIRequest as api } from '@bigtix/middleware';
import { STATUS_CODES, BadRequestError, NotFoundError } from '@bigtix/common';
import { TicketMasterAPIService } from '../lib/TicketMasterAPIService';

const router = express.Router();

/**
 * Searches for events using TicketMaster API with given keyword search
 *
 * @param {string} keyword  The keyword to search for events
 *
 * @returns {Promise<Response>}  The response from the request
 *
 * @throws {BadRequestError}  If the keyword is not provided
 * @throws {NotFoundError}  If the events are not found
 * @throws {ServerError}  If the events are not found
 * @throws {APIError}  If the events are not found
 * @throws {APIError}  If the events are not found
 */
router.get('/search/', api.callAsync(async (req: Request, res: Response) => {
  if (!req.query || !req.query.keyword) {
    throw new BadRequestError('Please search for an event, artist, or venue');
  }

  const keyword = req.query.keyword as string;

  const response = await TicketMasterAPIService.searchForEvents(keyword)

  res.status(STATUS_CODES.SUCCESS).send(response);
}));

/**
 * Gets the details of an event using TicketMaster API
 *
 * @param {string} tmEventId  The ticketmaster event id of the event
 *
 * @returns {Promise<Response>}  The response from the request
 *
 * @throws {BadRequestError}  If the event id is not provided
 * @throws {NotFoundError}  If the event is not found
 * @throws {ServerError}  If the event is not found
 * @throws {APIError}  If the event is not found
 * @throws {APIError}  If the event is not found
 */
router.get('/details/:tmEventId', api.callAsync(async (req: Request, res: Response) => {
  if (!req.params || !req.params.tmEventId) {
    throw new BadRequestError('Event ID is required');
  }

  const tmEventId = req.params.tmEventId as string;

  const response = await TicketMasterAPIService.getEventDetails(tmEventId)

  res.status(STATUS_CODES.SUCCESS).send(response);
}));

export { router as ticketMasterAPIRouter };
