
console.log("Hello World!");

const http = require('http');
const fs = require('fs');

const PORT = 8080;
const AUDIO_FILE = './01 Paper Cut.mp3'; // Replace with your audio file path

const server = http.createServer((req, res) => {
  if (req.url !== '/stream') {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  const audioStream = fs.createReadStream(AUDIO_FILE);

  res.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Transfer-Encoding': 'chunked',
  });

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
  console.log(`Server listening on port ${PORT}`);
});

