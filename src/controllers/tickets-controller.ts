import { Response } from 'express';
import httpStatus from 'http-status';
import { Ticket } from '@prisma/client';
import ticketsService from '../services/tickets-service';
import { AuthenticatedRequest } from '@/middlewares';
import { TicketTypeId } from '@/protocols';

export async function getTicketType(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketsList = await ticketsService.getTicketType();

    return res.status(httpStatus.OK).send(ticketsList);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getTicketFromUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const ticketsUser = await ticketsService.getTicketFromUser(userId);

    return res.status(httpStatus.OK).send(ticketsUser);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketTypeId } = req.body as TicketTypeId;

  try {
    const ticket = await ticketsService.postTicket(ticketTypeId, userId);

    console.log(ticket);

    return res.status(httpStatus.CREATED).send(ticket);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
