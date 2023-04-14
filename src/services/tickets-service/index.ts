import { Ticket, TicketType } from '@prisma/client';
import ticketsRepository from '@/repositories/tickets-repository';
import { notFoundError } from '@/errors';

async function getTicketType(): Promise<TicketType[]> {
  return await ticketsRepository.getTicketType();
}

async function getTicketFromUser(userId: number): Promise<Ticket & { TicketType: TicketType }> {
  const userEnrollment = await ticketsRepository.getUserByEnrollment(userId);

  if (!userEnrollment) throw notFoundError();

  const result = await ticketsRepository.getTicketFromUser(userId);

  return result;
}

const ticketsService = {
  getTicketType,
  getTicketFromUser,
};

export default ticketsService;
