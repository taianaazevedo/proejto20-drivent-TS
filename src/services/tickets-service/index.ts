import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import ticketsRepository from '@/repositories/tickets-repository';
import { notFoundError, requestError } from '@/errors';

async function getTicketType(): Promise<TicketType[]> {
  return await ticketsRepository.getTicketType();
}

async function getTicketFromUser(userId: number): Promise<Ticket & { TicketType: TicketType }> {
  const userEnrollment = await ticketsRepository.getUserByEnrollment(userId);

  if (!userEnrollment) throw notFoundError();

  const result = await ticketsRepository.getTicketFromUser(userId);

  if (!result) throw notFoundError();

  return result;
}

async function postTicket(ticketTypeId: number, userId: number): Promise<Ticket & { TicketType: TicketType }> {
  const userEnrollment = await ticketsRepository.getUserByEnrollment(userId);

  if (!userEnrollment) throw notFoundError();

  const result = await ticketsRepository.postTicket(ticketTypeId, userEnrollment.id);

  return result;
}

const ticketsService = {
  getTicketType,
  getTicketFromUser,
  postTicket,
};

export default ticketsService;
