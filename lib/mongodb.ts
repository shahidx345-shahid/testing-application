import mongoose, { Mongoose } from 'mongoose';

let cachedClient: Mongoose | null = null;

export async function connectToDatabase(): Promise<Mongoose> {
  // Return cached connection if available
  if (cachedClient) {
    return cachedClient;
  }

  // Get connection string from environment
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    // Connect to MongoDB
    const client = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });

    // Cache the connection
    cachedClient = client;

    return client;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cachedClient) {
    await mongoose.disconnect();
    cachedClient = null;
  }
}

export default connectToDatabase;
