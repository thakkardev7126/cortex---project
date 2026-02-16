import { Router } from "express";

const router = Router();

router.get("/", async (_req, res) => {
    res.json({
        alerts: [],
        message: "Alerts fetched successfully",
    });
});

export default router;
