"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get("/", async (_req, res) => {
    try {
        const policies = await prisma.policy.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json({
            policies,
            message: "Policies fetched successfully",
        });
    }
    catch (error) {
        console.error("Failed to fetch policies:", error);
        res.status(500).json({
            error: "Failed to fetch policies",
        });
    }
});
exports.default = router;
