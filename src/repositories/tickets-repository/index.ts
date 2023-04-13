import { prisma } from '@/config';

async function getTicketType() {
  return prisma.ticketType.findMany();
}

const ticketsRepository = {
  getTicketType,
};

export default ticketsRepository;
