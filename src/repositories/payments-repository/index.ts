import { prisma } from '@/config';
import { PaymentParams } from '@/protocols';

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

async function createPayment(ticketId: number, params: PaymentParams) {
  return prisma.payment.create({
    data: {
      ticketId,
      ...params,
    },
  });
}

async function getPaymentAndTicketByTicketId(ticketId: number) {
  return await prisma.payment.findFirst({
    where: {
      ticketId,
    },
    include: {
      Ticket: {
        include: {
          TicketType: true,
        },
      },
    },
  });
}

export default { findPaymentByTicketId, createPayment, getPaymentAndTicketByTicketId };
