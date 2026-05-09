/**
 * Database Layer - Central Export
 * 
 * Export database connection and models
 */

import connectDB, { isConnected, disconnectDB } from './connection/mongodb';
import Blog from './models/blog.model';
import User from './models/user.model';
import Booking from './models/booking.model';

// Export connection utilities
export { connectDB, isConnected, disconnectDB };

// Export models
export { Blog, User, Booking };

// Export types
export type { IBlog, CreateBlogInput, UpdateBlogInput, BlogFilters } from './models/blog.model';
export { BlogCategory } from './models/blog.model';

export type { IUser, CreateUserInput, LoginInput } from './models/user.model';
export { UserRole } from './models/user.model';

export type { IBooking } from './models/booking.model';
export { BookingStatus } from './models/booking.model';

// Default export
export default connectDB;
