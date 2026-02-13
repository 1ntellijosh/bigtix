/**
 * Main entry point for payments microservice (payments-srv) Jest setup and testing
 *
 * @since payments-srv-start--JP
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoMemDbServer: MongoMemoryServer | null;

// Mock Stripe to avoid requiring real API key in tests
jest.mock('../src/lib/Stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        status: 'requires_action',
        client_secret: 'test-client-secret',
        id: 'test-intent-id',
      }),
    },
    webhooks: {
      constructEvent: jest.fn().mockResolvedValue({
        data: {
          object: {
            metadata: {
              orderId: 'order-id',
            }
          },
          type: 'payment_intent.succeeded'
        }
      })
    }
  },
}));

// Mock EventPublisher and OrderEventDataFactory to avoid RabbitMQ connection failure in routes tests
jest.mock('../src/events/PaymentsEventDataFactory', () => {
  return {
    PaymentsEventDataFactory: jest.fn().mockImplementation(() => ({
      setData: jest.fn().mockReturnThis(),
      buildEvent: jest.fn().mockReturnValue({ metadata: {}, data: {} }),
    })),
  };
});

jest.mock('@bigtix/middleware', () => {
  const actual = jest.requireActual('@bigtix/middleware');
  
  // Mock EventPublisher as a class with prototype method so jest.spyOn works
  class MockEventPublisher {
    constructor(factory: any) {
      // Accept factory parameter but don't use it
    }
    async publishEvent(...args: any[]): Promise<void> {
      // Default implementation - can be spied on
      return Promise.resolve();
    }
  }
  
  return {
    ...actual,
    EventPublisher: MockEventPublisher,
  };
});

beforeAll(async () => {
  process.env.JWT_KEY = 'test-jwt-key';
  mongoMemDbServer = await MongoMemoryServer.create();
  const mongoUri = mongoMemDbServer.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection?.db?.collections();
  if (collections) {
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoMemDbServer) await mongoMemDbServer.stop();
  await mongoose.connection.close();
});
