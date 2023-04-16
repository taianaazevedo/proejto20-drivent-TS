import { Enrollment, Payment, Ticket, TicketType, TicketStatus } from '@prisma/client';
import { prisma } from '@/config';
import { PaymentBody } from '@/protocols';

async function getTicketById(ticketId: number): Promise<Ticket & { Enrollment: Enrollment; TicketType: TicketType }> {
  return await prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      Enrollment: true,
      TicketType: true,
    },
  });
}

async function getPayment(ticketId: number): Promise<Payment> {
  return await prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

async function postPayment(data: PaymentBody, price: number): Promise<Payment> {
  const digitsCard = data.cardData.number;
  const lastDigits = digitsCard.slice(digitsCard.length - 4);

  return await prisma.payment.create({
    data: {
      ticketId: data.ticketId,
      value: price,
      cardIssuer: data.cardData.issuer,
      cardLastDigits: lastDigits,
    },
  });
}

async function updateTicket(status: TicketStatus, ticketId: number): Promise<Ticket> {
  return await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status,
    },
  });
}

const paymentsRepository = {
  getTicketById,
  getPayment,
  postPayment,
  updateTicket,
};

export default paymentsRepository;
