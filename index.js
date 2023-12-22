
console.log("Starting Server...");

const http = require('http');
const fs = require('fs');

const PORT = 8000;
const AUDIO_FILE = './01 Paper Cut.mp3'; // Replace with your audio file path

let streamStartMillisecond = -1;

const server = http.createServer((req, res) => {
  if (req.url !== '/stream') {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Transfer-Encoding': 'chunked',
    'Connection': 'keep-alive'
  });

  const requestTime = Date.now();
  const bytesToBeSkipped = (320 / 8) * Math.abs(streamStartMillisecond - requestTime) / 1000;

  const audioStream = fs.createReadStream(AUDIO_FILE); // Create a pass-through stream

  audioStream.on('data', (chunk) => {
    res.write(chunk);
  });

  audioStream.on('end', () => {
    res.end();
  });

  audioStream.on('error', (err) => {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  });
});

server.listen(PORT, () => {
  streamStartMillisecond = Date.now();
  console.log(`Server listening on port ${PORT}`);
});
