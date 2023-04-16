import { Enrollment, TicketType, Ticket, TicketStatus } from '@prisma/client';
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
  return await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId,
      },
    },
    include: {
      TicketType: true,
    },
  });
}

async function postTicket(
  ticketTypeId: number,
  enrollmentId: number,
  status: TicketStatus,
): Promise<Ticket & { TicketType: TicketType }> {
  return await prisma.ticket.create({
    data: {
      ticketTypeId,
      enrollmentId,
      status,
    },
    include: {
      TicketType: true,
    },
  });
}

const ticketsRepository = {
  getUserByEnrollment,
  getTicketType,
  getTicketFromUser,
  postTicket,
};

export default ticketsRepository;
