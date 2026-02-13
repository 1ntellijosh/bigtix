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

router.get('/events/search/', api.callAsync(async (req: Request, res: Response) => {
  if (!req.query || !req.query.keyword) {
    throw new BadRequestError('Please search for an event, artist, or venue');
  }

  const keyword = req.query.keyword as string;

  const response = await TicketMasterAPIService.searchForEvents(keyword)

  res.status(STATUS_CODES.SUCCESS).send(response);
}));

export { router as ticketMasterAPIRouter };