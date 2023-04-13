import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import ticketsService from '@/services/tickets-service';

export async function getTicketType(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketsList = await ticketsService.getTicketType();

    return res.status(200).send(ticketsList);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}
