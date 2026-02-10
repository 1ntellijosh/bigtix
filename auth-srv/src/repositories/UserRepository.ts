/**
 * Repository for User database logic
 *
 * @since users-service-continued--JP
 */
import { AbstractRepository } from "@bigtix/middleware";
import { User, SavedUserDoc, NewUserAttrs } from "../models/User";

export class UserRepository implements AbstractRepository {
  /**
   * @inheritdoc
   */
  async create(attrs: NewUserAttrs): Promise<any> {
    const user = User.build(attrs);
    await user.save();

    return user;
  }

  /**
   * @inheritdoc
   */
  async findById(id: string): Promise<SavedUserDoc | null> {
    return User.findById(id);
  }

  /**
   * Finds a user by given email
   *
   * @param email  The email of the user to find
   *
   * @returns The user in data store
   */
  async findByEmail(email: string): Promise<SavedUserDoc | null> {
    return User.findOne({ email });
  }

  /**
   * @inheritdoc
   */
  async updateById(id: string, attrs: object): Promise<SavedUserDoc | null> {
    // { returnDocument: 'after' } means return the updated document
    return User.findByIdAndUpdate(id, attrs, { returnDocument: 'after' });
  }

  /**
   * @inheritdoc
   */
  async deleteById(id: string): Promise<SavedUserDoc | null> {
    return User.findByIdAndDelete(id);
  }

  /**
   * Deletes a user by given email
   *
   * @param email  The email of the user to delete
   *
   * @returns The deleted user in data store
   */
  async deleteByEmail(email: string): Promise<SavedUserDoc | null> {
    return User.findOneAndDelete({ email });
  }
}
