// ================== CONFIG ==================
import 'dotenv/config'; // Load .env variables

const ADMIN_CODE = process.env.ADMIN_CODE || "mySecretCode"; // Admin login code
const GITHUB_REPO = process.env.GITHUB_REPO || "your-username/your-repo";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
// ============================================

import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Admin auth endpoint
app.post("/api/login", (req, res) => {
    const { code } = req.body;
    if (code === ADMIN_CODE) {
        return res.json({ success: true });
    }
    return res.status(401).json({ success: false });
});

// List repo HTML files
app.get("/api/files", async (req, res) => {
    try {
        const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/`;
        const response = await fetch(url);
        const data = await response.json();

        const htmlFiles = data
            .filter((file) => file.name.endsWith(".html"))
            .map((file) => file.name);

        res.json(htmlFiles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch repo files." });
    }
});

// Proxy GitHub raw HTML
app.get("/api/file/:name", async (req, res) => {
    const { name } = req.params;
    try {
        const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${name}`;
        const response = await fetch(url);
        const content = await response.text();
        res.send(content);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading file.");
    }
});

app.listen(PORT, () => {
    console.log(`? Server running at http://localhost:${PORT}`);
});
