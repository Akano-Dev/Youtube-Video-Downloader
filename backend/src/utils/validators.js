/**
 * Validate that a string is a valid YouTube URL
 */
function isValidYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // Patterns for YouTube URLs
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?.*v=[\w-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]{11}/,
    /^https?:\/\/youtu\.be\/[\w-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]{11}/,
  ];

  return patterns.some(pattern => pattern.test(trimmed));
}

module.exports = { isValidYouTubeUrl };
