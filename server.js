import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3999;

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Shutdown endpoint
app.post('/api/shutdown', (req, res) => {
    res.json({ message: 'Shutting down...' });
    console.log('Received shutdown signal. Closing server...');

    // Give time for the response to send
    setTimeout(() => {
        process.exit(0);
    }, 500);
});

// Find Chrome/Chromium executable
function findChrome() {
    const candidates = process.platform === 'darwin'
        ? [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          ]
        : process.platform === 'win32'
        ? [
            `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
            `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`,
            `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
            `${process.env.PROGRAMFILES}\\Microsoft\\Edge\\Application\\msedge.exe`,
          ]
        : [ // Linux
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
          ];

    return candidates.find(c => existsSync(c)) || null;
}

// Start server
const server = app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);

    const url = `http://localhost:${PORT}`;
    const chrome = findChrome();

    if (chrome) {
        // Launch in app mode: no address bar, no bookmarks, no menus, thin frame
        const cmd = `"${chrome}" --app=${url} --window-size=1280,800`;
        exec(cmd, (err) => {
            if (err) console.error('Chrome launch error:', err.message);
        });
        console.log('Launched in app mode (minimal UI)');
    } else {
        // Fallback: open in default browser
        const open = (await import('open')).default;
        await open(url);
        console.log('Chrome not found, opened in default browser');
    }
});
