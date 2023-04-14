import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getTicketFromUser, getTicketType, postTicket } from '@/controllers/tickets-controller';
import { ticketSchema } from '@/schemas/tickets-schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketType)
  .get('/', getTicketFromUser)
  .post('/', validateBody(ticketSchema), postTicket);

export { ticketsRouter };
