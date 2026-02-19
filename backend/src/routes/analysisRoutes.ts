import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

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

const calculateEntropy = (buffer: Buffer): number => {
    if (!buffer.length) return 0;

    const counts = new Array(256).fill(0);
    for (const byte of buffer) counts[byte]++;

    let entropy = 0;
    for (const count of counts) {
        if (!count) continue;
        const p = count / buffer.length;
        entropy -= p * Math.log2(p);
    }
    return entropy;
};

const buildAnalysisResult = (file: Express.Multer.File, buffer: Buffer) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const lowerName = file.originalname.toLowerCase();

    let score = 8;
    const findings: string[] = [];

    const riskyExts = new Set([".exe", ".dll", ".ps1", ".bat", ".vbs", ".js", ".jar", ".scr", ".sh"]);
    if (riskyExts.has(ext)) {
        score += 28;
        findings.push(`Executable/script extension detected (${ext || "no extension"}).`);
    }

    if (["payload", "keygen", "crack", "dropper", "trojan", "rat", "backdoor"].some((w) => lowerName.includes(w))) {
        score += 30;
        findings.push("Filename contains high-risk malware-related keywords.");
    }

    if (buffer.length > 10 * 1024 * 1024) {
        score += 10;
        findings.push("Large file size detected (>10MB). Review file intent.");
    }

    const entropy = calculateEntropy(buffer);
    if (entropy >= 7.4) {
        score += 35;
        findings.push("High entropy suggests packed or obfuscated content.");
    } else if (entropy >= 6.8) {
        score += 18;
        findings.push("Moderately high entropy detected.");
    } else {
        findings.push("Entropy within normal range.");
    }

    // basic binary signature indicators
    const header = buffer.subarray(0, 4).toString("hex");
    if (header.startsWith("4d5a")) {
        score += 20;
        findings.push("PE header (MZ) found.");
    } else if (header === "7f454c46") {
        score += 18;
        findings.push("ELF binary header found.");
    }

    const threatLevel = Math.min(100, score);

    let status: "safe" | "suspicious" | "malicious" = "safe";
    if (threatLevel >= 70) status = "malicious";
    else if (threatLevel >= 30) status = "suspicious";

    if (!findings.length) {
        findings.push("No suspicious indicators detected by heuristic scanner.");
    }

    return {
        fileName: file.originalname,
        status,
        threatLevel,
        findings,
        timestamp: new Date().toISOString(),
        analysisTime: "1.1s",
        entropy: entropy.toFixed(2),
        sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
    };
};

// SANDBOX SCAN ENDPOINT 
router.post("/scan", upload.single("file"), async (req, res) => {
    let uploadedPath: string | null = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        uploadedPath = req.file.path;
        const buffer = fs.readFileSync(uploadedPath);
        const result = buildAnalysisResult(req.file, buffer);

        return res.json(result);
    } catch (error) {
        console.error("Scan failed:", error);
        return res.status(500).json({ error: "Failed to scan file" });
    } finally {
        if (uploadedPath && fs.existsSync(uploadedPath)) {
            fs.unlink(uploadedPath, () => undefined);
        }
    }
});

// Backward-compatible endpoint for older frontend deployments.
router.post("/sandbox", upload.single("file"), async (req, res) => {
    let uploadedPath: string | null = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        uploadedPath = req.file.path;
        const buffer = fs.readFileSync(uploadedPath);
        const result = buildAnalysisResult(req.file, buffer);

        return res.json(result);
    } catch (error) {
        console.error("Sandbox scan failed:", error);
        return res.status(500).json({ error: "Failed to scan file" });
    } finally {
        if (uploadedPath && fs.existsSync(uploadedPath)) {
            fs.unlink(uploadedPath, () => undefined);
        }
    }
});

export default router;
