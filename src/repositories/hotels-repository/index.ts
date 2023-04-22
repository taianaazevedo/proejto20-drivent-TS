import { Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

async function getHotels(): Promise<Hotel[]> {
  return await prisma.hotel.findMany();
}

async function getHotelWithRoom(hotelId: number): Promise<
  Hotel & {
    Rooms: Room[];
  }
> {
  return await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

const hotelsRepository = {
  getHotels,
  getHotelWithRoom,
};

export default hotelsRepository;
