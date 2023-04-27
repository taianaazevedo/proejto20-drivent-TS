import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  try {
    await bookingService.getBooking(userId);

    return res.sendStatus(httpStatus.OK);
  } catch (e) {
    next(e);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const roomId: number = req.body;
  try {
    const booking = await bookingService.postBooking(userId, roomId);

    return res.send(httpStatus.OK).send(booking);
  } catch (e) {
    next(e);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { bookingId } = req.params;
  const roomId: number = req.body;
  try {
    const bookingUpdated = await bookingService.updateBooking(userId, bookingId, roomId);

    return res.send(httpStatus.OK).send(bookingUpdated);
  } catch (e) {
    next(e);
  }
}
