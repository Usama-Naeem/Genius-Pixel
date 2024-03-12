import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// In express applications, we connect our application with db only once. But in next js, we have to connect with db
// on each server action or api request. because next js runs in serverless environment. Serverless functions are stateless means they start up
// to handel a request and shut down right after without maintaining a continuous connection with db. this approach ensures that each req handeled
// independently to ensure scalability and reliability as no need to manage persistance connection acrooss many instances which works well with scaleable nature
// of next js but doing that without any optimization means to many mongodb connections performs on server side.

// here for optimization, we cache the mongoose connection.
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) throw new Error("Missing MONGODB_URL");

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: "geniuspixel",
      bufferCommands: false,
    });

  cached.conn = await cached.promise;

  return cached.conn;
};
