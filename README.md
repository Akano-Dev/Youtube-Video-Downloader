# YT Downloader — Personal Use

A full-stack YouTube downloader built with React + Vite (frontend) and Node.js + Express (backend).
Uses `yt-dlp` for downloading and `ffmpeg` for audio conversion.

> ⚠️ **For personal use only.** Respect YouTube's Terms of Service and copyright laws.

---

## Folder Structure

```
yt-downloader/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── downloadController.js
│   │   ├── routes/
│   │   │   └── api.js
│   │   ├── services/
│   │   │   └── ytdlpService.js
│   │   ├── utils/
│   │   │   └── validators.js
│   │   └── index.js
│   ├── temp/               ← auto-created, holds in-progress downloads
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── downloader.js
│   │   ├── components/
│   │   │   ├── DownloadButton.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── FormatSelector.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── QualitySelector.jsx
│   │   │   ├── UrlInput.jsx
│   │   │   └── VideoCard.jsx
│   │   ├── pages/
│   │   │   └── HomePage.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Prerequisites

### 1. Install yt-dlp

**Windows:**
```bash
# Using pip
pip install yt-dlp

# Or download the binary directly:
# https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
# Place it somewhere on your PATH (e.g., C:\Windows\System32\)
```

**macOS:**
```bash
brew install yt-dlp
# or
pip install yt-dlp
```

**Linux:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

Verify: `yt-dlp --version`

---

### 2. Install ffmpeg

**Windows:**
```bash
# Using winget
winget install ffmpeg

# Or using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html and add to PATH
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg       # Debian/Ubuntu
sudo dnf install ffmpeg       # Fedora
```

Verify: `ffmpeg -version`

---

### 3. Install Node.js

Download from https://nodejs.org (v18+ recommended).

---

## Installation & Running

### Step 1 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 2 — Configure backend environment

```bash
# Copy the example env file
cp .env.example .env
# Edit .env if needed (defaults work out of the box)
```

### Step 3 — Start the backend

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Backend runs at: **http://localhost:5000**

---

### Step 4 — Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### Step 5 — Start the frontend

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Usage

1. Open **http://localhost:5173** in your browser
2. Paste a YouTube URL into the input field (it auto-fetches on paste)
3. Review the video title, thumbnail, and duration
4. Choose **MP4** (video) or **MP3** (audio)
5. For MP4, select quality: 360p, 720p, or 1080p
6. Click **Download** — the file will be processed and saved to your Downloads folder

---

## API Endpoints

### `POST /api/info`
Fetch video metadata.

**Request:**
```json
{ "url": "https://www.youtube.com/watch?v=..." }
```

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 245,
  "durationFormatted": "4:05",
  "uploader": "Channel Name",
  "viewCount": 1234567,
  "availableQualities": [360, 720, 1080]
}
```

### `POST /api/download`
Download and stream a file.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "format": "mp4",
  "quality": "720"
}
```

**Response:** Binary file stream with `Content-Disposition: attachment` header.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `yt-dlp: command not found` | Ensure yt-dlp is installed and on your PATH |
| `ffmpeg: command not found` | Ensure ffmpeg is installed and on your PATH |
| Download fails for 1080p | Some videos don't have 1080p — try 720p |
| CORS error in browser | Make sure backend is running on port 5000 |
| Slow download | Normal for large files — progress bar shows status |

If yt-dlp or ffmpeg are not on PATH, set their full paths in `backend/.env`:
```
YTDLP_PATH=C:\tools\yt-dlp.exe
FFMPEG_PATH=C:\tools\ffmpeg.exe
```
