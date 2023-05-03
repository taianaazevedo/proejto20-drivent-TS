import { Room } from '@prisma/client';
import hotelsService from '../hotels-service';
import { cannotBookingError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function verifyAvailabilityFromRooms(roomId: number): Promise<Room> {
  const room = await bookingRepository.findRoomById(roomId);

  if (!room) throw notFoundError();

  const qntyOfBookings = await bookingRepository.countBookingsFromRoom(roomId);

  if (qntyOfBookings >= room.capacity) throw cannotBookingError();

  return room;
}

async function verifyTicketAndPaymentFromUser(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();

  if (ticket.status !== 'PAID' || ticket.TicketType.includesHotel === false || ticket.TicketType.isRemote === true)
    throw cannotBookingError();

  return [enrollment, ticket];
}

async function getBooking(userId: number): Promise<{
  Room: Room;
  id: number;
}> {
  const booking = await bookingRepository.getBooking(userId);

  if (!booking) throw notFoundError();

  return booking;
}

async function postBooking(userId: number, roomId: number): Promise<number> {
  await verifyTicketAndPaymentFromUser(userId);

  await verifyAvailabilityFromRooms(roomId);

  return await bookingRepository.postBooking(userId, roomId);
}

async function updateBooking(userId: number, bookingId: string, roomId: number): Promise<number> {
  const booking_id = Number(bookingId);

  await verifyAvailabilityFromRooms(roomId);

  const userBooking = await bookingRepository.getBooking(userId);

  if (!userBooking) throw cannotBookingError();

  return await bookingRepository.updateBooking(roomId, booking_id, userId);
}

const bookingService = {
  getBooking,
  postBooking,
  updateBooking,
};

export default bookingService;
