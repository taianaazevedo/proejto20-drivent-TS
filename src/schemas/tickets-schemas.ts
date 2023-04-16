import Joi from 'joi';
import { TicketTypeId } from '@/protocols';

export const ticketSchema = Joi.object<TicketTypeId>({
  ticketTypeId: Joi.number().required(),
});
