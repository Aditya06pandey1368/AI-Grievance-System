import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. FIX IMPORTS (Add './src/' prefix)
import connectDB from './src/config/db.js';
import startCronJobs from './src/services/cron.service.js';

// Routes
import authRoutes from './src/routes/auth.routes.js';
import complaintRoutes from './src/routes/complaint.routes.js';
import departmentRoutes from './src/routes/department.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import statsRoutes from './src/routes/stats.routes.js';
import slaRoutes from './src/routes/sla.routes.js'

dotenv.config();
connectDB();
startCronJobs();

const app = express();

app.use(express.json());
app.use(cors());

// 2. FIX STATIC FOLDER PATH
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Since server.js is at root, 'uploads' is in the same directory, not up (..)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/sla', slaRoutes);

app.get('/', (req, res) => {
  res.send('Grievance AI API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});