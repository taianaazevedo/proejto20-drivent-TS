import { Response } from 'express';
import httpStatus from 'http-status';
import ticketsService from '../services/tickets-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getTicketType(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketsList = await ticketsService.getTicketType();

    return res.status(200).send(ticketsList);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getTicketFromUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const ticketsUser = await ticketsService.getTicketFromUser(userId);

    return res.status(200).send(ticketsUser);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
