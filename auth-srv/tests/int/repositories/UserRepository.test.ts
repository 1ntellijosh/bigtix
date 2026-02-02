/**
 * Tests for UserRepository
 *
 * @since tests-start--JP
 */
import { UserRepository } from '../../../src/repositories/UserRepository';

const userRepo = new UserRepository();

const validEmail = 'someguy@someemail.com';
let savedUserId: string | undefined;

describe('UserRepository', () => {
  beforeEach(async () => {
    const savedUser = await userRepo.create({ email: validEmail, password: 'password' });
    if (!savedUser) throw new Error('Failed to save user');
    savedUserId = savedUser._id.toString();
  });

  it('should successfully save a new user in the database, and return the user', async () => {
    const user = await userRepo.findByEmail(validEmail);
    expect(user).toBeDefined();
    expect(user?.email).toBe(validEmail);
    expect(user?.password).toBeDefined();
  });

  it('should return null if user is not found', async () => {
    const foundUser = await userRepo.findByEmail('nonexistent@email.com');
    expect(foundUser).toBeNull();
  });

  it('should return saved user if searched for by email', async () => {
    const foundUser = await userRepo.findByEmail(validEmail);
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(validEmail);
    expect(foundUser?.password).toBeDefined();
  });

  it('should return saved user if searched for by id', async () => {

    const foundUser = await userRepo.findById(savedUserId!);
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(validEmail);
    expect(foundUser?.password).toBeDefined();
  });

  it('should successfully update user email and password in database', async () => {
    const changes = {
      email: 'somenewemail@someemail.com',
      password: 'newpassword'
    };
    await userRepo.updateById(savedUserId!, changes);

    const foundUser = await userRepo.findById(savedUserId!);
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(changes.email);
    expect(foundUser?.password).toBe(changes.password);
  });

  it('should successfully delete user from database by id', async () => {
    const user = await userRepo.findById(savedUserId!);
    expect(user).toBeDefined();
    await userRepo.deleteById(savedUserId!);

    const foundUser = await userRepo.findById(savedUserId!);
    expect(foundUser).toBeNull();
  });

  it('should successfully delete user from database by email', async () => {
    const user = await userRepo.findByEmail(validEmail);
    expect(user).toBeDefined();
    await userRepo.deleteByEmail(validEmail);

    const foundUser = await userRepo.findByEmail(validEmail);
    expect(foundUser).toBeNull();
  });
});