import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types';

export { UserRole };

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyName?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.SHIPPER,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
      default: null,
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;

export type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  companyName?: string;
};
export type LoginInput = { email: string; password: string };
