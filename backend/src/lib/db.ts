import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-travel';
  // await mongoose.connect(uri);
  // console.log('MongoDB connected');
  // Inside your connectDB function:
  await mongoose.connect(process.env.MONGO_URI!, {
    family: 4 // This explicitly forces Node to connect using IPv4
  });
  console.log("mongodb connected with IPv4  preference");   
}
