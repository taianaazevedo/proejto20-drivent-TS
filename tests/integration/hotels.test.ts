import httpStatus from 'http-status';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import {
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketType,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicketTypeWithoutHotel,
  createUser,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotel, createRooms } from '../factories/hotels-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const api = supertest(app);

describe('GET /hotels', () => {
  describe('When token is invalid or doesnt exists', () => {
    it('Should respond with status 401 if no token is given', async () => {
      const result = await api.get('/hotels');

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should respond with status 401 if given token is not valid', async () => {
      const token = 'randomWord';
      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When token is valid', () => {
    it('Should respond with status 404 if there is no enrollment for given userId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should respond with status 404 if user has no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should respond with status 403 when ticket is not PAID', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, 'RESERVED');

      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 403 when ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, 'PAID');

      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 403 when ticket doesnt includes hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, 'PAID');

      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 404 when there is no hotels', async () => {
      const token = await generateValidToken();

      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should respond with status 200 and all hotels found listed', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();

      const result = await api.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual([
        {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
        },
      ]);
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  describe('When token is invalid or doesnt exists', () => {
    it('Should respond with status 401 if no token is given', async () => {
      const result = await api.get('/hotels/1');

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('Should respond with status 401 if given token is not valid', async () => {
      const token = 'randomWord';
      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When token is valid', () => {
    it('Should respond with status 404 if there is no enrollment for given userId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should respond with status 404 if user has no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should respond with status 402 when ticket is not PAID', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, 'RESERVED');

      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 402 when ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, 'PAID');

      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 402 when ticket doesnt includes hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, 'PAID');

      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it('Should respond with status 404 if hotel doesnt exist', async () => {
      const token = await generateValidToken();

      const result = await api.get('/hotels/1').set('Authorization', `Bearer ${token}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should be respond with status 200 with hotel and rooms', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRooms(hotel.id);

      const result = await api.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString(),
          },
        ],
      });
    });
  });
});
