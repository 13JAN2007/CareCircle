import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.ts';
import familyRoutes from './routes/familyRoutes.ts';
import doctorRoutes from './routes/doctorRoutes.ts';
import appointmentRoutes from './routes/appointmentRoutes.ts';
import recordRoutes from './routes/recordRoutes.ts';
import dashboardRoutes from './routes/dashboardRoutes.ts';
import settingsRoutes from './routes/settingsRoutes.ts';
import { authMiddleware } from './auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/family', authMiddleware, familyRoutes);
app.use('/api/doctors', authMiddleware, doctorRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api/records', authMiddleware, recordRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve frontend build from dist if available
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`CareCircle server running on http://localhost:${PORT}`);
});
