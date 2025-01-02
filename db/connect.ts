import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your Mongo URI to env variables');
}

const uri: string = process.env.DATABASE_URL;
let client: MongoClient;
let mongoClientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).

  const globalClientPromise = global as unknown as typeof globalThis & {
    _mongoClientPromise: Promise<MongoClient>;
  };

  if (!globalClientPromise._mongoClientPromise) {
    client = new MongoClient(uri);
    globalClientPromise._mongoClientPromise = client.connect();
  }
  mongoClientPromise = globalClientPromise._mongoClientPromise;
  console.log('connected to DB');
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  mongoClientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export { mongoClientPromise };
