const http = require('http');
const { spawn } = require('child_process');

const ffmpeg = spawn('ffmpeg', [
  '-i', 'path/to/your/audio.mp3', // Replace with your audio file path
  '-f', 'mpegts',
  '-codec:a', 'libmp3lame',
  '-b:a', '128k',
  '-' // Output to stdout
]);

const server = http.createServer((req, res) => {
  if (req.url === '/stream') {
    res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
    ffmpeg.stdout.pipe(res); // Pipe FFmpeg output to response
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

class MultiConsumerWritableStream extends WritableStream {
    constructor(...consumers) {
        super({
            start(controller) {
                this.consumers = consumers.map(consumer => consumer.getWriter());
                controller.ready;
            },
            write(chunk, controller) {
                try {
                    for (const writer of this.consumers) {
                        writer.write(chunk);
                    }
                    controller.ready;
                } catch (error) {
                controller.error(error);
                }
            },
            close(controller) {
                for (const writer of this.consumers) {
                    try {
                        writer.close();
                    } catch (error) {
                        // Log or handle errors during consumer closure
                    }
                }
                controller.close();
            },
        });
    }
}