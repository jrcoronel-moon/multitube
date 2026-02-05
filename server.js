import express from 'express';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Start server
const server = app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);
    // Open the browser
    await open(`http://localhost:${PORT}`);
});
