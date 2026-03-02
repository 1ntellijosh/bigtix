/**
 * Main entry point for tickets microservice (tickets-srv) Jest setup and testing
 *
 * @since tests-start--JP
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoMemDbServer: MongoMemoryServer | null;

// Mock EventPublisher and TicketEventDataFactory to avoid RabbitMQ connection failure in routes tests
jest.mock('../src/events/TicketEventDataFactory', () => {
  return {
    TicketEventDataFactory: jest.fn().mockImplementation(() => ({
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

const SETUP_TIMEOUT_MS = 30_000; // MongoMemoryServer.create() can be slow in CI (download/start)

// Create DB once; clear before each test (no per-test server creation). Avoid redundant afterEach in test files.
jest.setTimeout(15_000); // Hooks and tests in CI may be slow; 5s default can cause intermittent failures.

beforeAll(async () => {
  process.env.JWT_KEY = 'test-jwt-key';
  process.env.TICKETMASTER_CONSUMER_KEY = process.env.TICKETMASTER_CONSUMER_KEY || 'test-consumer-key';
  mongoMemDbServer = await MongoMemoryServer.create();
  const mongoUri = mongoMemDbServer.getUri();
  await mongoose.connect(mongoUri);
}, SETUP_TIMEOUT_MS);

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
}, SETUP_TIMEOUT_MS);
