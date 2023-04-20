import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotels = await hotelsService.getHotels(userId);

    return res.status(httpStatus.OK).send(hotels);
  } catch (e) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getHotelWithRoom(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;

  if (!hotelId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const hotelWithRoom = await hotelsService.getHotelWithRoom(hotelId, userId);

    return res.status(httpStatus.OK).send(hotelWithRoom);
  } catch (e) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
