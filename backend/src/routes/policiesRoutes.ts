import { Router } from "express";

const router = Router();

router.get("/", async (_req, res) => {
    res.json({
        policies: [],
        message: "Policies fetched successfully",
    });
});

export default router;
