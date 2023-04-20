import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const hotels = await hotelsService.getHotels(userId);

    return res.status(httpStatus.OK).send(hotels);
  } catch (e) {
    next(e);
  }
}

export async function getHotelWithRoom(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { hotelId } = req.params;

  if (!hotelId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const hotelWithRoom = await hotelsService.getHotelWithRoom(hotelId, userId);

    return res.status(httpStatus.OK).send(hotelWithRoom);
  } catch (e) {
    next(e);
  }
}
