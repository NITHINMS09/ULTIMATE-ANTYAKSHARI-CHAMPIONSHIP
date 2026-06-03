import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { WebSocketServer } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Set up Multer for memory storage of uploaded audio files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/* ── 1. Whisper Transcription Endpoint ──────────────────────── */
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  console.log('[API] Transcribe request received.');
  
  if (!req.file) {
    console.error('[API] No audio file uploaded.');
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const targetLetter = req.query.letter || '';
  
  if (!apiKey) {
    console.warn('[API] OpenAI API key is missing. Executing mock transcription fallback.');
    
    // Simulate Whisper processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Smart Mock fallback: If the user provides a target letter, pick a popular song starting with that letter.
    // This allows seamless offline testing.
    let mockText = 'Kesariya'; // Default fallback
    if (targetLetter) {
      const letterUpper = targetLetter.toUpperCase();
      const mockDatabase = {
        'A': 'Ae Dil Hai Mushkil',
        'B': 'Butta Bomma',
        'C': 'Chaiyya Chaiyya',
        'D': 'Dil To Pagal Hai',
        'E': 'Ek Ladki Ko Dekha',
        'F': 'Faded (Alan Walker)',
        'G': 'Gerua',
        'H': 'Hello (Adele)',
        'I': 'Imagine (John Lennon)',
        'J': 'Jhoome Jo Pathaan',
        'K': 'Kal Ho Naa Ho',
        'L': 'Lag Ja Gale',
        'M': 'Mere Sapno Ki Rani',
        'N': 'Naatu Naatu',
        'O': 'Oops I Did It Again',
        'P': 'Pehla Nasha',
        'Q': 'Queen (Bohemian Rhapsody)',
        'R': 'Roop Tera Mastana',
        'S': 'Shape Of You',
        'T': 'Tum Hi Ho',
        'U': 'Uptown Funk',
        'V': 'Viva La Vida',
        'W': 'Why This Kolaveri Di',
        'X': 'X Gon Give It To Ya',
        'Y': 'Yesterday (Beatles)',
        'Z': 'Zindagi Ek Safar'
      };
      mockText = mockDatabase[letterUpper] || 'Kesariya';
    }

    console.log(`[API] Mock transcription completed: "${mockText}"`);
    return res.json({ text: mockText, mode: 'mock_fallback' });
  }

  try {
    // Send audio buffer to OpenAI Whisper API
    console.log('[API] Sending audio buffer to OpenAI Whisper API...');
    const formData = new FormData();
    
    // Convert buffer to file-like object for FormData
    const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    if (targetLetter) {
      formData.append('prompt', `This song must start with the letter ${targetLetter.toUpperCase()}`);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('[API] OpenAI Whisper API returned an error:', errorDetails);
      throw new Error(`OpenAI API returned status ${response.status}: ${errorDetails}`);
    }

    const data = await response.json();
    console.log(`[API] OpenAI Whisper transcription result: "${data.text}"`);
    return res.json({ text: data.text, mode: 'openai_whisper' });

  } catch (error) {
    console.error('[API] Transcription failed:', error);
    return res.status(500).json({
      error: 'Transcription failed.',
      details: error.message
    });
  }
});

/* ── 2. YouTube Search Endpoint ────────────────────────────── */
app.post('/api/youtube-search', async (req, res) => {
  const { query } = req.body;
  console.log(`[API] YouTube search query: "${query}"`);

  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      console.log('[API] Searching YouTube via official Google API...');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=1`
      );

      if (!response.ok) {
        throw new Error(`Google API status ${response.status}`);
      }

      const data = await response.json();
      const videoId = data.items?.[0]?.id?.videoId;
      
      if (videoId) {
        console.log(`[API] YouTube match found: ${videoId}`);
        return res.json({ videoId });
      }
    } catch (err) {
      console.warn('[API] Official YouTube Search failed. Trying scraper fallback...', err);
    }
  }

  // Scraper Fallback: Scrape the YouTube search HTML to extract first video ID.
  // This is highly reliable for dev/localhost testing without API quota blocks.
  try {
    console.log('[API] Fetching YouTube search page (HTML Scraper Fallback)...');
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`YouTube responded with status ${response.status}`);
    }

    const html = await response.text();
    
    // Find video IDs from script tags using regex: /watch\?v=([a-zA-Z0-9_-]{11})/
    const videoMatches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)];
    
    if (videoMatches && videoMatches.length > 0) {
      // Clean up duplicates and filter out noise
      const videoIds = videoMatches.map(m => m[1]);
      // First video ID
      const targetVideoId = videoIds[0];
      console.log(`[API] Scraper matched YouTube video ID: ${targetVideoId}`);
      return res.json({ videoId: targetVideoId });
    }

    console.warn('[API] Scraper could not match video ID. Returning mock ID.');
    // Return standard music video ID (e.g. Rickroll or a generic audio block)
    return res.json({ videoId: 'dQw4w9WgXcQ', mode: 'rickroll_mock' });

  } catch (error) {
    console.error('[API] Scraper YouTube search failed:', error);
    // Return mock ID so the app never crashes
    return res.json({ videoId: 'dQw4w9WgXcQ', mode: 'rickroll_mock' });
  }
});

/* ── 3. Serve Built Production Frontend Assets ───────────────── */
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

/* ── 4. Create HTTP Server & WebSocket Sync Layer ────────────── */
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket upgrade manually
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
  
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total active clients: ${clients.size}`);

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      // Broadcast state updates and commands to all other connected tabs
      clients.forEach(client => {
        if (client !== ws && client.readyState === 1) { // 1 = OPEN
          client.send(JSON.stringify(parsed));
        }
      });
    } catch (err) {
      console.error('[WS] Error processing message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total active clients: ${clients.size}`);
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Backend running on http://localhost:${PORT}`);
  console.log(`[Server] WebSockets listening on ws://localhost:${PORT}/ws`);
});
