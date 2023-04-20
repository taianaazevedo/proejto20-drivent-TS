import { Hotel } from '@prisma/client';
import hotelsRepository from '@/repositories/hotels-repository';
import { notFoundError, paymentRequiredError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getHotels(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();

  if (ticket.status !== 'PAID') throw paymentRequiredError();

  if (ticket.TicketType.includesHotel === false) throw paymentRequiredError();

  if (ticket.TicketType.isRemote === true) throw paymentRequiredError();

  const hotels = await hotelsRepository.getHotels();

  if (hotels.length === 0) throw notFoundError();

  return hotels;
}

async function getHotelWithRoom(hotelId: string, userId: number) {
  const hotel_id = Number(hotelId);

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();

  if (ticket.status !== 'PAID') throw paymentRequiredError();

  if (ticket.TicketType.includesHotel === false) throw paymentRequiredError();

  if (ticket.TicketType.isRemote === true) throw paymentRequiredError();

  const hotelWithRoom = await hotelsRepository.getHotelWithRoom(hotel_id);

  if (!hotelWithRoom) throw notFoundError();

  return hotelWithRoom;
}

const hotelsService = {
  getHotels,
  getHotelWithRoom,
};

export default hotelsService;
