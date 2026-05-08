import connectDB, { User, UserRole } from '@/server/db';
import { UnauthorizedError, ConflictError } from '@/server/middlewares';
import type { LoginInput, RegisterInput, CreateUserByAdminInput } from '@/server/validations';

export async function loginUser(credentials: LoginInput) {
  await connectDB();
  const email = credentials.email.toLowerCase().trim();
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (!user.isActive) throw new UnauthorizedError('Account is deactivated');
  const isPasswordValid = await user.comparePassword(credentials.password);
  if (!isPasswordValid) throw new UnauthorizedError('Invalid email or password');
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  const { password, ...userWithoutPassword } = user.toObject();
  void password;
  return { ...userWithoutPassword, _id: user._id.toString() };
}

export async function registerUser(data: RegisterInput) {
  await connectDB();
  const email = data.email.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError('An account with this email already exists');
  const user = await User.create({ email, password: data.password, name: data.name, role: UserRole.SHIPPER, isActive: true });
  const { password, ...userWithoutPassword } = user.toObject();
  void password;
  return { ...userWithoutPassword, _id: user._id.toString() };
}

export async function createUserByAdmin(data: CreateUserByAdminInput) {
  await connectDB();
  const email = data.email.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError('An account with this email already exists');
  const user = await User.create({ email, password: data.password, name: data.name, role: data.role, companyName: data.companyName, isActive: true });
  const { password, ...userWithoutPassword } = user.toObject();
  void password;
  return { ...userWithoutPassword, _id: user._id.toString() };
}

export async function listUsers({ role, page = 1, limit = 20 }: { role?: string; page?: number; limit?: number }) {
  await connectDB();
  const filter = role ? { role } : {};
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { data: users.map((u) => ({ ...u, _id: u._id.toString() })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUserByEmail(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (!user) return null;
  return { ...user, _id: user._id.toString() };
}

export async function getUserById(id: string) {
  await connectDB();
  const user = await User.findById(id).lean();
  if (!user) return null;
  return { ...user, _id: user._id.toString() };
}

export async function adminExists(): Promise<boolean> {
  await connectDB();
  const adminCount = await User.countDocuments({ role: UserRole.ADMIN });
  return adminCount > 0;
}
