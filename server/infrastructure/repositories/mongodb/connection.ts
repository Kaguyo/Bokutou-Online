import mongoose, { Connection } from 'mongoose';

export default class Database {
  private connection: Connection | null = null;

  constructor() {}

  async connect(): Promise<Connection> {
    if (this.connection && this.connection.readyState === 1) {
      return this.connection;
    }

    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bokutouonline';

    try {
      const client = await mongoose.connect(MONGO_URI, {
        autoIndex: true,
      });

      this.connection = client.connection;
      
      console.log('MongoDB connected successfully');
      return this.connection;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  getConnection(): Connection {
    if (!this.connection || this.connection.readyState !== 1) {
      throw new Error("Database not initialized or connection lost. Call connect() first.");
    }
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      console.log('reset: MongoDB connection closed');
    }
  }
}