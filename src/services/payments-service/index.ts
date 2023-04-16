import { Payment, TicketStatus } from '@prisma/client';
import paymentsRepository from '@/repositories/payments-repository';
import { notFoundError, requestError, unauthorizedError } from '@/errors';
import { PaymentBody } from '@/protocols';

async function getPayment(userId: number, ticketId: number): Promise<Payment> {
  const ticketExist = await paymentsRepository.getTicketById(ticketId);

  if (!ticketExist) throw notFoundError();

  if (userId !== ticketExist.Enrollment.userId) throw unauthorizedError();

  return await paymentsRepository.getPayment(ticketId);
}

async function postPayment(data: PaymentBody, userId: number): Promise<Payment> {
  const status: TicketStatus = 'PAID';

  const paymentExist = await paymentsRepository.getTicketById(data.ticketId);

  if (!paymentExist) throw notFoundError();

  if (userId !== paymentExist.Enrollment.userId) throw unauthorizedError();

  await paymentsRepository.updateTicket(status, paymentExist.id);

  return await paymentsRepository.postPayment(data, paymentExist.TicketType.price);
}

const paymentsService = {
  getPayment,
  postPayment,
};

export default paymentsService;
