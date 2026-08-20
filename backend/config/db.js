import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<cluster>')) {
    console.warn('\n⚠️ [MongoDB Notice]: Your MONGODB_URI in backend/.env currently contains the placeholder "<cluster>".');
    console.warn('👉 Please replace "<cluster>" in backend/.env with your actual MongoDB Atlas cluster host (or use "mongodb://127.0.0.1:27017/bx_analytics" for local MongoDB).\n');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`\n✅ [MongoDB Connected Successfully]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`\n❌ [MongoDB Connection Error]: ${error.message}`);
    console.warn('👉 Tip: Check your network connection, IP whitelist in Atlas, or MongoDB credentials in backend/.env.\n');
    return null;
  }
};

export default connectDB;
