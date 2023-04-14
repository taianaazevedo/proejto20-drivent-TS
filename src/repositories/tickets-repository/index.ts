import { Enrollment, TicketType, Ticket } from '@prisma/client';
import { prisma } from '@/config';

async function getUserByEnrollment(userId: number): Promise<Enrollment> {
  return await prisma.enrollment.findFirst({
    where: { userId },
  });
}

async function getTicketType(): Promise<TicketType[]> {
  return prisma.ticketType.findMany();
}

async function getTicketFromUser(userId: number): Promise<Ticket & { TicketType: TicketType }> {
  const result = await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: userId,
      },
    },
    include: {
      TicketType: true,
    },
  });

  console.log(result);
  return result;
}

const ticketsRepository = {
  getUserByEnrollment,
  getTicketType,
  getTicketFromUser,
};

export default ticketsRepository;
