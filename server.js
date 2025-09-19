// server.js
// ESM module: requires "type": "module" in package.json

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readdir, readFile, stat } from 'fs/promises';

//
// =============== CONFIG (top) ===============
// Edit these values or set them in your Render env variables (.env)
// ADMIN_CODE: code required to open the admin UI
// UBG_DIR: directory (relative to project root) where your .html apps live
// =============================================
const ADMIN_CODE = process.env.ADMIN_CODE || 'opensesame';
const UBG_DIR = process.env.UBG_DIR || 'public/UBG4ALL'; // relative path
const PORT = process.env.PORT || 3000;
// =============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
// serve static public folder normally
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Helper: ensure resolved path stays inside the allowed UBG_DIR
 */
function safeResolveFilename(filename) {
    // only allow simple filenames (no slashes)
    // strip any path components for safety
    const base = path.basename(filename);
    // only allow .html extension
    if (!/\.html?$/i.test(base)) return null;
    const resolved = path.resolve(path.join(__dirname, UBG_DIR, base));
    const allowedRoot = path.resolve(path.join(__dirname, UBG_DIR));
    if (!resolved.startsWith(allowedRoot)) return null;
    return { resolved, base };
}

// POST /api/login  -> simply verifies admin code (same behavior you had)
app.post('/api/login', (req, res) => {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ success: false, message: 'missing code' });
    if (code === ADMIN_CODE) return res.json({ success: true });
    return res.status(401).json({ success: false, message: 'invalid code' });
});

// GET /api/files -> list .html files in UBG_DIR root
app.get('/api/files', async (req, res) => {
    try {
        const folder = path.resolve(path.join(__dirname, UBG_DIR));
        // ensure folder exists
        const folderStat = await stat(folder).catch(() => null);
        if (!folderStat || !folderStat.isDirectory()) {
            return res.json([]); // return empty if folder missing
        }
        const items = await readdir(folder);
        // filter .html files only
        const htmlFiles = items.filter(n => /\.html?$/i.test(n));
        res.json(htmlFiles);
    } catch (err) {
        console.error('Error listing UBG files:', err);
        res.status(500).json({ error: 'failed to list files' });
    }
});

// GET /api/file/:name -> read file from UBG_DIR and return as HTML
app.get('/api/file/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const safe = safeResolveFilename(name);
        if (!safe) return res.status(400).send('invalid filename');
        const content = await readFile(safe.resolved, { encoding: 'utf8' });
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(content);
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).send('failed to load file');
    }
});

// fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} (UBG_DIR=${UBG_DIR})`);
});
