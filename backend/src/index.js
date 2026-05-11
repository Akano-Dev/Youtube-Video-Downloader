require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const TEMP_DIR = process.env.TEMP_DIR || './temp';

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler — returns JSON error to frontend
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Temp directory: ${path.resolve(TEMP_DIR)}`);

  // --- Startup diagnostics ---
  const ytdlpPath = process.env.YTDLP_PATH || 'yt-dlp';
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

  console.log(`\n🔍 Checking dependencies...`);
  console.log(`   YTDLP_PATH  = ${ytdlpPath}`);
  console.log(`   FFMPEG_PATH = ${ffmpegPath}`);

  // Check yt-dlp
  const ytdlpExe = path.isAbsolute(ytdlpPath) ? path.resolve(ytdlpPath) : ytdlpPath;
  execFile(ytdlpExe, ['--version'], { shell: false }, (err, stdout) => {
    if (err) {
      console.error(`   ❌ yt-dlp NOT found: ${err.message}`);
      console.error(`      → Fix: set YTDLP_PATH in backend/.env to the full path of yt-dlp.exe`);
    } else {
      console.log(`   ✅ yt-dlp found: v${stdout.trim()}`);
    }
  });

  // Check ffmpeg
  const ffmpegExe = path.isAbsolute(ffmpegPath) ? path.resolve(ffmpegPath) : ffmpegPath;
  execFile(ffmpegExe, ['-version'], { shell: false }, (err, stdout) => {
    if (err) {
      console.error(`   ❌ ffmpeg NOT found: ${err.message}`);
      console.error(`      → Fix: install ffmpeg (winget install ffmpeg) or set FFMPEG_PATH in backend/.env`);
    } else {
      const version = (stdout.match(/ffmpeg version (\S+)/) || [])[1] || 'unknown';
      console.log(`   ✅ ffmpeg found: v${version}`);
    }
  });

  console.log('');
});
