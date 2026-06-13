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
  const language = req.query.language || '';
  
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

    // Build enhanced prompt with target letter and language hints
    let promptText = '';
    if (targetLetter) {
      promptText += `This song must start with the letter ${targetLetter.toUpperCase()}. `;
    }
    if (language && language !== 'all') {
      promptText += `The song is sung in the ${language} language. `;
    }
    if (promptText) {
      formData.append('prompt', promptText.trim());
    }

    // Set ISO 639-1 language code parameter if specific language is provided
    if (language && language !== 'all') {
      const langMap = {
        kannada: 'kn',
        malayalam: 'ml',
        tamil: 'ta',
        telugu: 'te',
        hindi: 'hi',
        english: 'en',
        punjabi: 'pa',
        bengali: 'bn'
      };
      const isoCode = langMap[language.toLowerCase()];
      if (isoCode) {
        formData.append('language', isoCode);
      }
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

/* ── 2. Google Speech API Proxy Endpoint ───────────────────── */
app.post('/api/google-speech', upload.single('audio'), async (req, res) => {
  console.log('[API] Google Speech Proxy request received.');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const language = req.query.language || 'hi-IN';

  if (!apiKey) {
    console.warn('[API] Google API key is missing. Executing mock speech fallback.');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return res.json({ text: 'Kesariya', confidence: 0.92, mode: 'mock_fallback' });
  }

  try {
    const audioContent = req.file.buffer.toString('base64');
    const requestPayload = {
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: language,
        alternativeLanguageCodes: ['kn-IN', 'ml-IN', 'ta-IN', 'te-IN', 'en-IN', 'pa-IN', 'bn-IN']
      },
      audio: {
        content: audioContent
      }
    };

    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Speech API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const result = data.results?.[0]?.alternatives?.[0];
    
    if (result) {
      console.log(`[API] Google Speech Proxy result: "${result.transcript}" (confidence: ${result.confidence})`);
      return res.json({
        text: result.transcript,
        confidence: result.confidence || 0.8,
        mode: 'google_speech_api'
      });
    } else {
      return res.json({ text: '', confidence: 0, mode: 'google_speech_api' });
    }
  } catch (error) {
    console.error('[API] Google Speech Proxy failed:', error);
    return res.status(500).json({ error: 'Google Speech Proxy failed', details: error.message });
  }
});

/* ── 3. MusicBrainz Search Endpoint ─────────────────────────── */
app.post('/api/musicbrainz-search', async (req, res) => {
  const { title, artist } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    let url = `https://musicbrainz.org/ws/2/recording?query=recording:${encodeURIComponent(title)}`;
    if (artist) {
      url += `%20AND%20artist:${encodeURIComponent(artist)}`;
    }
    url += '&fmt=json';

    console.log(`[MusicBrainz] Querying API: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UltimateAntyakshariChampionship/1.0.0 (appup@example.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`MusicBrainz API responded with status ${response.status}`);
    }

    const data = await response.json();
    const recordings = data.recordings || [];
    
    // Format response
    const results = recordings.slice(0, 5).map(rec => ({
      id: rec.id,
      title: rec.title,
      artist: rec['artist-credit']?.map(ac => ac.name).join(', ') || 'Unknown Artist',
      album: rec.releases?.[0]?.title || '',
      score: rec.score
    }));

    return res.json({ recordings: results });
  } catch (error) {
    console.error('[MusicBrainz] Search failed:', error);
    return res.status(500).json({ error: 'MusicBrainz search failed', details: error.message });
  }
});

/* ── 4. Corrections Storage Endpoint ───────────────────────── */
const CORRECTIONS_FILE = path.join(__dirname, 'corrections.json');

app.get('/api/corrections', (req, res) => {
  try {
    if (fs.existsSync(CORRECTIONS_FILE)) {
      const data = fs.readFileSync(CORRECTIONS_FILE, 'utf8');
      return res.json(JSON.parse(data));
    }
    return res.json([]);
  } catch (error) {
    console.error('[API] Failed to read corrections:', error);
    return res.status(500).json({ error: 'Failed to read corrections' });
  }
});

app.post('/api/corrections', (req, res) => {
  const { wrongText, correctTitle, artist, movie, language } = req.body;
  if (!wrongText || !correctTitle) {
    return res.status(400).json({ error: 'wrongText and correctTitle are required' });
  }

  try {
    let corrections = [];
    if (fs.existsSync(CORRECTIONS_FILE)) {
      const data = fs.readFileSync(CORRECTIONS_FILE, 'utf8');
      corrections = JSON.parse(data);
    }

    const newCorrection = {
      id: Date.now().toString(),
      wrongText: wrongText.toLowerCase().trim(),
      correctTitle: correctTitle.trim(),
      artist: artist || '',
      movie: movie || '',
      language: language || '',
      timestamp: Date.now()
    };

    corrections.push(newCorrection);
    fs.writeFileSync(CORRECTIONS_FILE, JSON.stringify(corrections, null, 2), 'utf8');
    
    console.log(`[API] Saved server-side correction: "${wrongText}" -> "${correctTitle}"`);
    return res.json({ success: true, correction: newCorrection });
  } catch (error) {
    console.error('[API] Failed to save correction:', error);
    return res.status(500).json({ error: 'Failed to save correction' });
  }
});

/* ── 5. YouTube Search Endpoint ────────────────────────────── */
async function searchYouTubeHelper(query) {
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
        return { videoId };
      }
    } catch (err) {
      console.warn('[API] Official YouTube Search failed. Trying scraper fallback...', err);
    }
  }

  // Scraper Fallback: Scrape the YouTube search HTML to extract first video ID.
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
    
    // Find video IDs from script tags using regex
    const videoMatches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)];
    
    if (videoMatches && videoMatches.length > 0) {
      const videoIds = videoMatches.map(m => m[1]);
      const targetVideoId = videoIds[0];
      console.log(`[API] Scraper matched YouTube video ID: ${targetVideoId}`);
      return { videoId: targetVideoId };
    }

    console.warn('[API] Scraper could not match video ID. Returning mock ID.');
    return { videoId: 'dQw4w9WgXcQ', mode: 'rickroll_mock' };

  } catch (error) {
    console.error('[API] Scraper YouTube search failed:', error);
    return { videoId: 'dQw4w9WgXcQ', mode: 'rickroll_mock' };
  }
}

app.post('/api/youtube-search', async (req, res) => {
  const { query } = req.body;
  console.log(`[API] YouTube search query: "${query}"`);

  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  const result = await searchYouTubeHelper(query);
  return res.json(result);
});

/* ── 6. Batch Song Validation Endpoint ──────────────────────── */
app.post('/api/validate-songs', async (req, res) => {
  const { songs } = req.body;
  if (!Array.isArray(songs)) {
    return res.status(400).json({ error: 'Songs array is required' });
  }

  console.log(`[API] Batch validating ${songs.length} songs...`);
  const results = [];

  for (const song of songs) {
    const query = `${song.title} ${song.artist || ''} official audio`.trim();
    let ytStatus = 'skipped';
    let videoId = '';

    try {
      const ytRes = await searchYouTubeHelper(query);
      if (ytRes.videoId) {
        ytStatus = 'valid';
        videoId = ytRes.videoId;
      } else {
        ytStatus = 'invalid';
      }
    } catch (e) {
      ytStatus = 'error';
    }

    results.push({
      id: song.id,
      title: song.title,
      artist: song.artist,
      youtubeStatus: ytStatus,
      videoId,
      timestamp: Date.now()
    });
  }

  return res.json({ results });
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
