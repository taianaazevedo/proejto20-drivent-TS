import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getTicketType } from '@/controllers/tickets-controller';

const ticketsRouter = Router();

ticketsRouter.all('/*', authenticateToken).get('/types', getTicketType).get('/').post('/');

export { ticketsRouter };
