import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './lib/db';
import authRoutes from './routes/auth';
import tripRoutes from './routes/trips';
import { requireAuth } from './middleware/auth';

dotenv.config();

const app = express();

import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/trips', requireAuth);   
app.use('/api/trips', tripRoutes);

app.get('/api/ping', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}).catch(err => {
  console.error('Failed to connect DB', err);
});
