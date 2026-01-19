import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs'; // Import FS to check if folder exists
import { fileURLToPath } from 'url';

// 1. Imports
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
// startCronJobs(); // You can uncomment this when needed

const app = express();

// 2. Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Allow your frontend
    credentials: true
}));

// 3. FIX STATIC FOLDER PATH (With Debugging)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the absolute path to the uploads folder
const uploadsPath = path.join(__dirname, 'uploads');

// --- DEBUG LOG: Check this in your terminal! ---
console.log("📂 Serving static files from:", uploadsPath);

// Check if folder exists
if (!fs.existsSync(uploadsPath)){
    console.error("⚠️  WARNING: 'uploads' directory does not exist. Creating it...");
    fs.mkdirSync(uploadsPath);
}

// Mount the static folder
// This means: http://localhost:5000/uploads/image.jpg -> server/uploads/image.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. API Routes
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