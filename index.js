const http = require('http');
const AudioContext = window.AudioContext || window.webkitAudioContext;

const audioContext = new AudioContext();
let globalAudioBufferSourceNode;

server.listen(3000, () => {
  createGlobalStream('01 Paper Cut.mp3')
    .then(node => {
      globalAudioBufferSourceNode = node;
      console.log('Global audio stream created successfully');
    })
    .catch(error => {
      console.error('Error creating global stream:', error);
      // Implement error handling, e.g., graceful server shutdown
    });

  console.log('Server listening on port 3000');
});

async function createGlobalStream(audioFile) {
  try {
    const response = await fetch(audioFile);
    const audioBuffer = await response.arrayBuffer();
    const audioBufferSourceNode = audioContext.createBufferSource();
    audioBufferSourceNode.buffer = await audioContext.decodeAudioData(audioBuffer);
    audioBufferSourceNode.loop = true;
    audioBufferSourceNode.connect(audioContext.destination);
    audioBufferSourceNode.start();

    return audioBufferSourceNode;
  } catch (error) {
    throw error; // Re-throw for handling in server.listen()
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/stream') {
    if (!globalAudioBufferSourceNode) {
      res.writeHead(503); // Service Unavailable
      res.end('Global audio stream not yet ready');
      return;
    }

    const offsetTime = audioContext.currentTime;
    const stream = audioContext.createMediaStreamDestination();
    globalAudioBufferSourceNode.start(offsetTime);
    globalAudioBufferSourceNode.connect(stream);

    const mediaStream = stream.stream;
    res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
    mediaStream.pipeTo(res);
  } else {
    // Handle other requests
    res.writeHead(404);
    res.end('Not found');
  }
});