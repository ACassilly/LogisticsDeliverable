import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global { var mongoose: MongooseCache | undefined; }

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portlandia_logistics';

if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable inside .env.local');

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };
if (!global.mongoose) global.mongoose = cached;

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
      .then(m => { console.log('✅ MongoDB connected'); return m; })
      .catch(e => { console.error('❌ MongoDB error:', e); throw e; });
  }
  try { cached.conn = await cached.promise; }
  catch (e) { cached.promise = null; throw e; }
  return cached.conn;
}

export function isConnected(): boolean { return mongoose.connection.readyState === 1; }
export async function disconnectDB(): Promise<void> {
  if (cached.conn) { await cached.conn.disconnect(); cached.conn = null; cached.promise = null; }
}
export default connectDB;
