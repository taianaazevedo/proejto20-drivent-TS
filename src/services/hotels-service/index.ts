import ticketService from '../tickets-service';
import hotelsRepository from '@/repositories/hotels-repository';
import { notFoundError, paymentRequiredError } from '@/errors';
import paymentsRepository from '@/repositories/payments-repository';

async function verifyUserInfo(userId: number) {
  const ticket = await ticketService.getTicketByUserId(userId);

  if (!ticket) throw notFoundError();

  const payment = await paymentsRepository.getPaymentAndTicketByTicketId(ticket.id);

  if (!payment) throw notFoundError();

  if (payment.Ticket.status === 'RESERVED') throw paymentRequiredError();

  if (payment.Ticket.TicketType.isRemote === true) throw paymentRequiredError();

  if (payment.Ticket.TicketType.includesHotel === false) throw paymentRequiredError();

  return payment;
}

async function getHotels(userId: number) {
  await verifyUserInfo(userId);

  const hotels = await hotelsRepository.getHotels();

  if (!hotels) throw notFoundError();

  return hotels;
}

async function getHotelWithRoom(hotelId: string, userId: number) {
  const hotel_id = Number(hotelId);

  await verifyUserInfo(userId);

  const hotelWithRoom = await hotelsRepository.getHotelWithRoom(hotel_id);

  if (hotelWithRoom.Rooms.length === 0) throw notFoundError();

  return hotelWithRoom;
}

const hotelsService = {
  getHotels,
  getHotelWithRoom,
};

export default hotelsService;
