"use strict";
/*import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
// router.post('/refresh', refresh);
// router.post('/logout', logout);

export default router;*/
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get("/db-connection", async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({ connected: true });
    }
    catch (error) {
        res.status(500).json({
            connected: false,
            error: "Database connection failed",
        });
    }
});
exports.default = router;
