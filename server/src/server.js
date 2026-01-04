import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize App
const app = express();

// 4. Middlewares (Security & Parsing)
app.use(helmet()); // Adds security headers
app.use(cors());   // Allows frontend access
app.use(express.json()); // Parses JSON body

// 5. Test Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running in production mode' });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});