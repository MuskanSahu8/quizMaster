import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizmaster';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500, // Timeout swiftly if local MongoDB daemon is not running
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`⚠️  MongoDB connection notice: ${error.message}`);
    console.log(`ℹ️  Running with QuizMaster In-Memory Data Store with full CRUD, seeded quizzes, auth, attempts & analytics.`);
    console.log(`ℹ️  To connect to persistent MongoDB, ensure mongod is running or supply MONGO_URI in backend/.env`);
    return false;
  }
};

export const getDbStatus = () => ({
  connected: isMongoConnected,
  type: isMongoConnected ? 'MongoDB' : 'In-Memory Store',
  database: isMongoConnected ? mongoose.connection.name : 'quizmaster_memory',
  host: isMongoConnected ? mongoose.connection.host : 'localhost'
});
