import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Ensure uploads directory exists (Render-safe)
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

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
    } catch (error) {
        console.error("Scan failed:", error);
        return res.status(500).json({ error: "Failed to scan file" });
    }
});

export default router;
