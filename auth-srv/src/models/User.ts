/**
 * User model for auth-srv
 *
 * @since users-service-continued--JP
 */
import mongoose from "mongoose";
import { PasswordService as passSvc } from "../middleware/PasswordService";

interface NewUserAttrs {
  email: string;
  password: string;
}

interface SavedUserDoc extends mongoose.Document {
  id: string;
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<SavedUserDoc> {
  /**
   * Builds a new user document
   *
   * @param {NewUserAttrs} attrs  The attributes for the new user
   *
   * @returns {SavedUserDoc}  The new user document
   */
  build(attrs: NewUserAttrs): SavedUserDoc;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    // Clean up the user object before returning it
    transform(doc, ret) {
      const userObj = ret as Record<string, unknown>;
      userObj.id = userObj._id;
      delete userObj._id;
      delete userObj.password;
      delete userObj.__v;
    },
  },
});

/**
 * Builds a new user document
 *
 * @param {NewUserAttrs} attrs  The attributes for the new user
 *
 * @returns {SavedUserDoc}  The new user document
 */
userSchema.statics.build = (attrs: NewUserAttrs) => {
  return new User(attrs);
};

// Hash the given password before saving the user document
userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    const hashed = await passSvc.toHash(this.get('password'));
    this.set('password', hashed);
  }
});

const User = mongoose.model<SavedUserDoc, UserModel>('User', userSchema);

export { User, SavedUserDoc, NewUserAttrs };