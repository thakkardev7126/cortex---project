/*import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
// router.post('/refresh', refresh);
// router.post('/logout', logout);

export default router;*/


/*import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/db-connection", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ connected: true });
    } catch (error) {
        res.status(500).json({
            connected: false,
            error: "Database connection failed",
        });
    }
});

export default router;*/

import { Router } from "express";
import { register, login } from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
