import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getTicketFromUser, getTicketType } from '@/controllers/tickets-controller';

const ticketsRouter = Router();

ticketsRouter.all('/*', authenticateToken).get('/types', getTicketType).get('/', getTicketFromUser).post('/');

export { ticketsRouter };
