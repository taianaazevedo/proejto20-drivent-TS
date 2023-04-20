import ticketService from '../tickets-service';
import hotelsRepository from '@/repositories/hotels-repository';
import { notFoundError, paymentRequiredError } from '@/errors';
import paymentsRepository from '@/repositories/payments-repository';

async function getHotels(userId: number) {
  const ticket = await verifyUserTicket(userId);

  await verifyPaymentFromUser(ticket.id);

  const hotels = await hotelsRepository.getHotels();

  if (!hotels) throw notFoundError();

  return hotels;
}

async function getHotelWithRoom(hotelId: string, userId: number) {
  const hotel_id = Number(hotelId);

  const ticket = await verifyUserTicket(userId);

  await verifyPaymentFromUser(ticket.id);

  const hotelWithRoom = await hotelsRepository.getHotelWithRoom(hotel_id);

  if (hotelWithRoom.Rooms.length === 0 || !hotelWithRoom) throw notFoundError();

  return hotelWithRoom;
}

async function verifyUserTicket(userId: number) {
  const ticket = await ticketService.getTicketByUserId(userId);

  if (!ticket) throw notFoundError();

  return ticket;
}

async function verifyPaymentFromUser(ticketId: number) {
  const payment = await paymentsRepository.getPaymentAndTicketByTicketId(ticketId);

  if (!payment) throw notFoundError();

  if (payment.Ticket.status === 'RESERVED') throw paymentRequiredError();

  if (payment.Ticket.TicketType.isRemote === true) throw paymentRequiredError();

  if (payment.Ticket.TicketType.includesHotel === false) throw paymentRequiredError();

  return payment;
}
const hotelsService = {
  getHotels,
  getHotelWithRoom,
};

export default hotelsService;
