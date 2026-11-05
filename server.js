const express = require('express');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());

function findMediaFile(dirCandidates, extensions) {
  for (const dirName of dirCandidates) {
    const dirPath = path.join(__dirname, dirName);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      const files = fs.readdirSync(dirPath);
      const match = files.find((f) =>
        extensions.some((ext) => f.toLowerCase().endsWith(ext))
      );
      if (match) {
        return path.join(dirPath, match);
      }
    }
  }
  return null;
}

function streamMediaWithRange(req, res, filePath, contentType) {
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Media file not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      return res.end();
    }

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

app.get('/api/media/music', (req, res) => {
  const musicFile = findMediaFile(
    ['music', 'Music', 'musica', 'Musica'],
    ['.mp4', '.m4a', '.mp3', '.wav', '.ogg']
  );
  streamMediaWithRange(req, res, musicFile, 'audio/mp4');
});

app.get('/api/media/video', (req, res) => {
  const videoFile = findMediaFile(
    ['video', 'Video', 'videos', 'Videos'],
    ['.mp4', '.webm', '.mov']
  );
  streamMediaWithRange(req, res, videoFile, 'video/mp4');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(
  express.static(path.join(__dirname, 'public'), {
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    },
  })
);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
