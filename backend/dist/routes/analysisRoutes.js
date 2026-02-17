"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Ensure uploads directory exists (Render-safe)
const uploadDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Multer config
const storage = multer_1.default.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
// 🔹 SANDBOX SCAN ENDPOINT
router.post("/scan", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // ✅ MOCK ANALYSIS (MVP / DEMO SAFE)
        return res.json({
            fileName: req.file.originalname,
            status: "safe",
            threatLevel: 12,
            findings: [
                "No malicious signatures found",
                "Entropy within normal range",
                "No suspicious system calls detected",
            ],
            timestamp: new Date().toISOString(),
            analysisTime: "1.2s",
            entropy: "4.32",
            sha256: "demo-sha256-hash",
        });
    }
    catch (error) {
        console.error("Scan failed:", error);
        return res.status(500).json({ error: "Failed to scan file" });
    }
});
exports.default = router;
