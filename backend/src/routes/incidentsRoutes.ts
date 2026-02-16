import { Router } from "express";

const router = Router();

router.get("/", async (_req, res) => {
    res.json({
        incidents: [],
        message: "Incidents fetched successfully",
    });
});

export default router;
