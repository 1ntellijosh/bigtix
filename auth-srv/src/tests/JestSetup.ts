/**
 * Main entry point for auth microservice (auth-srv) Jest setup and testing
 *
 * @since tests-start--JP
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoMemDbServer: MongoMemoryServer | null;

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
