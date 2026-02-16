"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    res.json({
        alerts: [],
        message: "Alerts fetched successfully",
    });
});
exports.default = router;
