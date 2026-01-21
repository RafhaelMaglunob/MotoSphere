import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import './config/firebase.js'; // Initialize Firebase
import authRoutes from './routes/auth.js';
import { verifyToken } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MotoSphere API is running' });
});

// Catch-all route for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
