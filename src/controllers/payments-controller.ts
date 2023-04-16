import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { PaymentBody, TicketId } from '@/protocols';
import paymentsService from '@/services/payments-service';

export async function getPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { ticketId } = req.query as TicketId;
  try {
    if (!ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);

    const payment = await paymentsService.getPayment(userId, parseInt(ticketId));

    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    next(error);
  }
}

export async function postPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const data = req.body as PaymentBody;

  try {
    if (!data.ticketId || !data.cardData) return res.sendStatus(httpStatus.BAD_REQUEST);

    const ticketPaid = await paymentsService.postPayment(data, userId);

    return res.status(httpStatus.OK).send(ticketPaid);
  } catch (error) {
    next(error);
  }
}
