import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import departmentRoutes from './routes/department.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import path from 'path';
import startCronJobs from './src/services/cron.service.js';

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

startCronJobs();

// 3. Initialize App
const app = express();
app.use(express.json());

// 4. Middlewares (Security & Parsing)
app.use(helmet()); // Adds security headers
app.use(cors()); 
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));  // Allows frontend access
app.use('/api/complaints', complaintRoutes);

// 5. Test Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running in production mode' });
});
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});