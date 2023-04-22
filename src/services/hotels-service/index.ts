import { Hotel, Room } from '@prisma/client';
import hotelsRepository from '@/repositories/hotels-repository';
import { notFoundError, paymentRequiredError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function verifyTicketAndPaymentFromUser(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();

  if (ticket.status !== 'PAID' || ticket.TicketType.includesHotel === false || ticket.TicketType.isRemote === true)
    throw paymentRequiredError();

  return [enrollment, ticket];
}

async function getHotels(userId: number): Promise<Hotel[]> {
  await verifyTicketAndPaymentFromUser(userId);

  const hotels = await hotelsRepository.getHotels();

  if (hotels.length === 0) throw notFoundError();

  return hotels;
}

async function getHotelWithRoom(hotelId: string, userId: number): Promise<Hotel & { Rooms: Room[] }> {
  const hotel_id = Number(hotelId);

  await verifyTicketAndPaymentFromUser(userId);

  const hotelWithRoom = await hotelsRepository.getHotelWithRoom(hotel_id);

  if (!hotelWithRoom) throw notFoundError();

  return hotelWithRoom;
}

const hotelsService = {
  getHotels,
  getHotelWithRoom,
};

export default hotelsService;
