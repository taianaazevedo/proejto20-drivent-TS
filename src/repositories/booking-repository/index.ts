import { prisma } from '@/config';

async function findRoomById(roomId: number) {
  return await prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
}

async function findBookingByUserId(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
}

async function getBooking(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function postBooking(userId: number, roomId: number) {
  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });

  return booking.id;
}

async function updateCapacityFromRoom(roomId: number, updateCapacity: number) {
  return await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      capacity: updateCapacity,
    },
  });
}

async function updateBooking(roomId: number, bookingId: number) {
  const update = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });

  return update.id;
}

const bookingRepository = {
  findRoomById,
  findBookingByUserId,
  updateCapacityFromRoom,
  getBooking,
  postBooking,
  updateBooking,
};

export default bookingRepository;
