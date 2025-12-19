import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import paymentRoutes from './routes/payment';
import adminRoutes from './routes/admin';
import pushRoutes from './routes/push';
import { createLogger } from './routes/utils/logger';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const logger = createLogger('server');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

app.use('/api', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/push', pushRoutes);

app.listen(PORT, '0.0.0.0', () => {
  logger.log(`Server is running on http://0.0.0.0:${PORT}`);
});