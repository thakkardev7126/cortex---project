import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import analysisRoutes from './routes/analysisRoutes';
import alertsRoutes from './routes/alertsRoutes';
import policiesRoutes from './routes/policiesRoutes';
import incidentsRoutes from './routes/incidentsRoutes';

export const prisma = new PrismaClient();
const app = express();

// =======================
// Middleware
// =======================
app.use(helmet());

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://cortex-project.vercel.app'
    ],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// =======================
// Static uploads (Sandbox)
// =======================
app.use('/uploads', express.static('uploads'));

// =======================
// Health & Root
// =======================
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.json({
        service: 'Cortex Backend',
        status: 'running'
    });
});

// =======================
// API Routes
// =======================
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/incidents', incidentsRoutes);

// =======================
// DB Connection Test
// =======================
app.get('/api/test/db-connection', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ connected: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ connected: false });
    }
});

// =======================
// Global Error Handler
// =======================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

export default app;
