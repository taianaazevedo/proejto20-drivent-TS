import httpStatus from 'http-status';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { cleanDb, generateValidToken } from '../helpers';

import {
  createEnrollmentWithAddress,
  createHotel,
  createPayment,
  createRoomWithCapacity,
  createRooms,
  createTicket,
  createTicketType,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicketTypeWithoutHotel,
  createUser,
} from '../factories';
import { createBooking } from '../factories/booking-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const api = supertest(app);

describe('GET /booking', () => {
  describe('When token is invalid or doesnt exist', () => {
    it('Should respond with status 401 if no token is given', async () => {
      const result = await api.get('/booking');

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should respond with status 401 if given token is not valid', async () => {
      const token = 'randomWord';
      const result = await api.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const result = await api.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When token is valid', () => {
    it('Should respond with status 200 and booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const result = await api.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });

    it('Should respond with status 404 if user has no booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const result = await api.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
  });
});

describe('POST /booking', () => {
  describe('When token is invalid or doesnt exist', () => {
    it('Should respond with status 401 if no token is given', async () => {
      const result = await api.get('/booking');

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should respond with status 401 if given token is not valid', async () => {
      const token = 'randomWord';
      const result = await api.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const result = await api.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When token is valid', () => {
    it('Should respond with status 200 and booking id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);

      const result = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({
        bookingId: expect.any(Number),
      });
    });

    it('Should respond with status 400 when roomId is missing', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const result = await api.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('Should respond with status 404 if user doesnt have a enrollment', async () => {
      const token = await generateValidToken();
      const result = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 if user doesnt have a ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const result = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should respond with status 403 when ticket is not PAID', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, 'RESERVED');

      const result = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 403 when ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, 'PAID');

      const result = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 403 when ticket doesnt includes hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, 'PAID');

      const result = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 404 if room doesnt exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      await createPayment(ticket.id, ticketType.price);
      await createHotel();

      const result = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should respond with status 403 when room is not available', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithCapacity(hotel.id);
      await createBooking(user.id, room.id);

      const result = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  describe('When token is invalid or doesnt exist', () => {
    it('Should respond with status 401 if no token is given', async () => {
      const result = await api.get('/booking');

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should respond with status 401 if given token is not valid', async () => {
      const token = 'randomWord';
      const result = await api.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const result = await api.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When token is valid', () => {
    it('Should respond with status 200 and booking id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const result = await api
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({
        bookingId: booking.id,
      });
    });
    it('Should respond with status 400 when roomId is missing', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const result = await api.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('Should respond with status 404 if room doesnt exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const result = await api
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: 2 });

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should respond with status 403 when room is not available', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithCapacity(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const result = await api
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 403 when user has no booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithCapacity(hotel.id);

      const result = await api.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});
