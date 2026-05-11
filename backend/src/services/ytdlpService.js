const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Normalize paths — resolve env vars and ensure forward slashes don't break Windows spawn
const YTDLP_RAW = process.env.YTDLP_PATH || 'yt-dlp';
const FFMPEG_RAW = process.env.FFMPEG_PATH || 'ffmpeg';
const TEMP_DIR = path.resolve(process.env.TEMP_DIR || './temp');

// On Windows, if a full path is given, resolve it properly
const YTDLP = path.isAbsolute(YTDLP_RAW) ? path.resolve(YTDLP_RAW) : YTDLP_RAW;
const FFMPEG = path.isAbsolute(FFMPEG_RAW) ? path.resolve(FFMPEG_RAW) : FFMPEG_RAW;

// yt-dlp --ffmpeg-location expects the DIRECTORY containing ffmpeg.exe
function getFfmpegDir() {
  if (FFMPEG === 'ffmpeg') return null; // on PATH, yt-dlp finds it automatically
  return path.dirname(FFMPEG);
}

/**
 * Run yt-dlp with given args — uses shell:true on Windows to handle path spaces
 */
function runYtDlp(args, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    // On Windows use shell:true so the OS can resolve the executable path correctly
    const isWin = process.platform === 'win32';

    console.log(`[yt-dlp] "${YTDLP}" ${args.slice(0, 4).join(' ')} ...`);

    // On Windows with shell:false, spawn handles absolute paths correctly
    // We pass the raw path and args separately — no quoting needed
    const proc = spawn(YTDLP, args, {
      windowsHide: true,
      shell: false, // shell:false avoids cmd.exe misinterpreting backslashes
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
      process.stdout.write('[yt-dlp] ' + d.toString());
    });

    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`yt-dlp timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      if (err.code === 'ENOENT') {
        reject(new Error(
          `yt-dlp executable not found at: "${YTDLP}"\n` +
          `Please check YTDLP_PATH in backend/.env`
        ));
      } else {
        reject(new Error(`Failed to start yt-dlp: ${err.message}`));
      }
    });
  });
}

/**
 * Sanitize a string for use as a filename
 */
function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
    .trim() || 'download';
}

/**
 * Fetch video metadata using yt-dlp --dump-json
 */
async function fetchVideoInfo(url) {
  const args = [
    '--dump-json',
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    url,
  ];

  let stdout;
  try {
    ({ stdout } = await runYtDlp(args, 30000));
  } catch (err) {
    const msg = err.message || '';
    console.error('[fetchVideoInfo error]', msg);

    if (msg.includes('Video unavailable') || msg.includes('not available')) {
      throw new Error('Video is unavailable or private');
    }
    if (msg.includes('not found') || msg.includes('ENOENT')) {
      throw new Error('yt-dlp not found. Check YTDLP_PATH in backend/.env');
    }
    // Extract the most useful line from yt-dlp error output
    const firstLine = msg.split('\n').find(l => l.trim()) || msg;
    throw new Error(`Failed to fetch video info: ${firstLine}`);
  }

  // yt-dlp can output multiple JSON lines — take the first valid one
  const lines = stdout.trim().split('\n');
  let data;
  for (const line of lines) {
    try {
      data = JSON.parse(line.trim());
      break;
    } catch { /* skip non-JSON lines */ }
  }

  if (!data) {
    console.error('[JSON parse error] stdout was:', stdout.substring(0, 500));
    throw new Error('Failed to parse video metadata from yt-dlp');
  }

  // Extract available video heights
  const formats = data.formats || [];
  const availableQualities = [...new Set(
    formats
      .filter(f => f.vcodec && f.vcodec !== 'none' && f.height)
      .map(f => f.height)
      .filter(h => [360, 720, 1080].includes(h))
  )].sort((a, b) => a - b);

  return {
    title: data.title || 'Unknown Title',
    thumbnail: data.thumbnail || '',
    duration: data.duration || 0,
    durationFormatted: formatDuration(data.duration || 0),
    uploader: data.uploader || data.channel || 'Unknown',
    viewCount: data.view_count || 0,
    availableQualities,
  };
}

/**
 * Download video or audio using yt-dlp
 */
async function processDownload(url, format, quality) {
  const id = uuidv4();
  const ext = format === 'mp3' ? 'mp3' : 'mp4';
  const outputTemplate = path.join(TEMP_DIR, `${id}.%(ext)s`);
  const ffmpegDir = getFfmpegDir();

  let args;

  if (format === 'mp3') {
    args = [
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', outputTemplate,
    ];
    if (ffmpegDir) args.push('--ffmpeg-location', ffmpegDir);
    args.push(url);
  } else {
    const h = { '360': 360, '720': 720, '1080': 1080 }[quality] || 720;

    // Robust format selector with multiple fallbacks
    const formatSelector = [
      `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]`,
      `bestvideo[height<=${h}]+bestaudio`,
      `best[height<=${h}]`,
      `bestvideo[ext=mp4]+bestaudio[ext=m4a]`,
      `bestvideo+bestaudio`,
      `best`,
    ].join('/');

    args = [
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '-f', formatSelector,
      '--merge-output-format', 'mp4',
      '-o', outputTemplate,
    ];
    if (ffmpegDir) args.push('--ffmpeg-location', ffmpegDir);
    args.push(url);
  }

  try {
    await runYtDlp(args, 600000); // 10 min timeout
  } catch (err) {
    const msg = err.message || '';
    console.error('[processDownload error]', msg);
    const firstLine = msg.split('\n').find(l => l.trim()) || msg;
    throw new Error(`Download failed: ${firstLine}`);
  }

  // Find the output file (yt-dlp replaces %(ext)s with actual extension)
  const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(id));
  if (files.length === 0) {
    throw new Error('Download completed but output file not found in temp folder');
  }

  const outputFile = path.join(TEMP_DIR, files[0]);

  // Build a nice filename from the video title
  let niceFilename = `download_${id}.${ext}`;
  try {
    const { stdout } = await runYtDlp(
      ['--get-title', '--no-playlist', '--no-warnings', '--no-check-certificates', url],
      15000
    );
    const title = stdout.trim().split('\n')[0];
    if (title) niceFilename = `${sanitizeFilename(title)}.${ext}`;
  } catch {
    // Non-fatal — use default filename
  }

  const finalPath = path.join(TEMP_DIR, niceFilename);

  if (outputFile !== finalPath) {
    if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
    fs.renameSync(outputFile, finalPath);
  }

  return { filePath: finalPath, filename: niceFilename };
}

/**
 * Format seconds into HH:MM:SS or MM:SS
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

module.exports = { fetchVideoInfo, processDownload };
