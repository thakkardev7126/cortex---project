import dotenv from 'dotenv';
dotenv.config();

import app, { prisma } from './app';
import { ensureDefaultData } from './utils/bootstrap';

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to database');

        await ensureDefaultData();
        console.log('✅ Default admin and policies ensured');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
