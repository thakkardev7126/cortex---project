import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (_req, res) => {
    try {
        const policies = await prisma.policy.findMany({
            orderBy: { createdAt: "desc" },
        });

        res.json({
            policies,
            message: "Policies fetched successfully",
        });
    } catch (error) {
        console.error("Failed to fetch policies:", error);
        res.status(500).json({
            error: "Failed to fetch policies",
        });
    }
});

export default router;
