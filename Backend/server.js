import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from Backend directory
const envPath = path.join(__dirname, '.env');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
  } else {
    console.log('✅ .env file loaded from:', envPath);
  }
} else {
  console.warn('⚠️  .env file not found at:', envPath);
}

// Debug: Log if Gmail credentials are loaded (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('📧 Gmail config check on startup:');
  console.log('   .env path:', envPath);
  console.log('   File exists:', fs.existsSync(envPath));
  
  // Try to read the file directly to debug
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/); // Handle both Windows and Unix line endings
    console.log('   Total lines in .env file:', lines.length);
    
    // Find Gmail lines (check various formats)
    const gmailUserLine = lines.find(line => line.trim().startsWith('GMAIL_USER=') && !line.trim().startsWith('#'));
    const gmailPassLine = lines.find(line => line.trim().startsWith('GMAIL_APP_PASSWORD=') && !line.trim().startsWith('#'));
    
    // Also check for lines with spaces
    const gmailUserLineWithSpace = lines.find(line => line.includes('GMAIL_USER') && !line.trim().startsWith('#'));
    const gmailPassLineWithSpace = lines.find(line => line.includes('GMAIL_APP_PASSWORD') && !line.trim().startsWith('#'));
    
    console.log('   GMAIL_USER line (exact match):', gmailUserLine ? 'Found: [' + gmailUserLine.trim() + ']' : 'Not found');
    console.log('   GMAIL_USER line (contains):', gmailUserLineWithSpace ? 'Found: [' + gmailUserLineWithSpace.trim() + ']' : 'Not found');
    console.log('   GMAIL_APP_PASSWORD line (exact match):', gmailPassLine ? 'Found: [' + gmailPassLine.trim().substring(0, 30) + '...]' : 'Not found');
    console.log('   GMAIL_APP_PASSWORD line (contains):', gmailPassLineWithSpace ? 'Found: [' + gmailPassLineWithSpace.trim().substring(0, 30) + '...]' : 'Not found');
    
    // Show lines 24-27 for debugging
    console.log('   Lines 24-27:');
    for (let i = 23; i < Math.min(27, lines.length); i++) {
      console.log(`      [${i + 1}] '${lines[i]}'`);
    }
  }
  
  console.log('   GMAIL_USER from process.env:', process.env.GMAIL_USER ? '✅ Set (' + process.env.GMAIL_USER + ')' : '❌ Not set');
  console.log('   GMAIL_APP_PASSWORD from process.env:', process.env.GMAIL_APP_PASSWORD ? '✅ Set (' + process.env.GMAIL_APP_PASSWORD.length + ' chars)' : '❌ Not set');
}

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
