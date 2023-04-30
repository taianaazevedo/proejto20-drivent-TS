import { Room } from '@prisma/client';
import hotelsService from '../hotels-service';
import { cannotBookingError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';

async function verifyAvailabilityFromRooms(roomId: number): Promise<Room> {
  const room = await bookingRepository.findRoomById(roomId);

  if (!room) throw notFoundError();

  const qntyOfBookings = await bookingRepository.countBookingsFromRoom(roomId);

  if (qntyOfBookings >= room.capacity) throw cannotBookingError();

  return room;
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
  await hotelsService.verifyTicketAndPaymentFromUser(userId);

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
