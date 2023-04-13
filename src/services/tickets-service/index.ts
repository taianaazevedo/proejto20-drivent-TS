import { TicketType } from '@/protocols';
import ticketsRepository from '@/repositories/tickets-repository';

async function getTicketType(): Promise<TicketType[]> {
  const result = await ticketsRepository.getTicketType();
  return result;
}

const ticketsService = {
  getTicketType,
};

export default ticketsService;
