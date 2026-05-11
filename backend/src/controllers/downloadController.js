const { fetchVideoInfo, processDownload } = require('../services/ytdlpService');
const { isValidYouTubeUrl } = require('../utils/validators');
const path = require('path');
const fs = require('fs');

/**
 * POST /api/info
 * Fetch video metadata from a YouTube URL
 */
async function getVideoInfo(req, res, next) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await fetchVideoInfo(url);
    res.json(info);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/download
 * Download a video/audio and stream it back to the client
 */
async function downloadVideo(req, res, next) {
  let filePath = null;

  try {
    const { url, format = 'mp4', quality = '720' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    if (!['mp4', 'mp3'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use mp4 or mp3' });
    }

    if (!['360', '720', '1080'].includes(quality)) {
      return res.status(400).json({ error: 'Invalid quality. Use 360, 720, or 1080' });
    }

    const result = await processDownload(url, format, quality);
    filePath = result.filePath;

    const fileName = path.basename(filePath);
    const stat = fs.statSync(filePath);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Length', stat.size);

    const readStream = fs.createReadStream(filePath);

    readStream.on('error', (streamErr) => {
      console.error('[Stream Error]', streamErr.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });

    readStream.on('close', () => {
      // Clean up temp file after streaming
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.warn('[Cleanup Warning]', unlinkErr.message);
        else console.log(`[Cleanup] Deleted temp file: ${fileName}`);
      });
    });

    readStream.pipe(res);
  } catch (err) {
    // Clean up on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }
    next(err);
  }
}

module.exports = { getVideoInfo, downloadVideo };
