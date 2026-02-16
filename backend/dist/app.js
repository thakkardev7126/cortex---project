"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const analysisRoutes_1 = __importDefault(require("./routes/analysisRoutes"));
const alertsRoutes_1 = __importDefault(require("./routes/alertsRoutes"));
const policiesRoutes_1 = __importDefault(require("./routes/policiesRoutes"));
const incidentsRoutes_1 = __importDefault(require("./routes/incidentsRoutes"));
exports.prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
// =======================
// Middleware
// =======================
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'https://cortex-project.vercel.app'
    ],
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
// =======================
// Static uploads (Sandbox)
// =======================
app.use('/uploads', express_1.default.static('uploads'));
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
app.use('/api/auth', authRoutes_1.default);
app.use('/api/events', eventRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/analysis', analysisRoutes_1.default);
app.use('/api/alerts', alertsRoutes_1.default);
app.use('/api/policies', policiesRoutes_1.default);
app.use('/api/incidents', incidentsRoutes_1.default);
// =======================
// DB Connection Test
// =======================
app.get('/api/test/db-connection', async (req, res) => {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        res.json({ connected: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ connected: false });
    }
});
// =======================
// Global Error Handler
// =======================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});
exports.default = app;
