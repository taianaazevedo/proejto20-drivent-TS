import hotelsService from '../hotels-service';
import { cannotBookingError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';

async function verifyAvailabilityFromRooms(roomId: number) {
  const room = await bookingRepository.findRoomById(roomId);

  if (!room) throw notFoundError();

  if (room.capacity <= 0) throw cannotBookingError();

  return room;
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.getBooking(userId);

  if (!booking) throw notFoundError();

  return booking;
}

async function postBooking(userId: number, roomId: number) {
  await hotelsService.verifyTicketAndPaymentFromUser(userId);

  const room = await verifyAvailabilityFromRooms(roomId);

  const booking = await bookingRepository.postBooking(userId, roomId);

  const updateCapacity = room.capacity - 1;

  await bookingRepository.updateCapacityFromRoom(roomId, updateCapacity);

  return booking;
}

async function updateBooking(userId: number, bookingId: string, roomId: number) {
  const booking_id = Number(bookingId);

  const room = await verifyAvailabilityFromRooms(roomId);

  const userBooking = await bookingRepository.getBooking(userId);

  if (!userBooking) throw cannotBookingError();

  const updateCapacityFromOldRoom = userBooking.Room.capacity + 1;

  const updateCapacityFromNewRoom = room.capacity - 1;

  await bookingRepository.updateCapacityFromRoom(roomId, updateCapacityFromNewRoom);

  await bookingRepository.updateCapacityFromRoom(userBooking.Room.id, updateCapacityFromOldRoom);

  return await bookingRepository.updateBooking(roomId, booking_id, userId);
}

const bookingService = {
  getBooking,
  postBooking,
  updateBooking,
};

export default bookingService;
