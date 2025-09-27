import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Импортируем маршруты
import paymentRoutes from './routes/payment';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Настройка CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

app.use('/api', paymentRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});