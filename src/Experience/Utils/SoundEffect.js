import { Howl } from 'howler';

export default class SoundEffect {
  constructor(audioFilePath, options = {}) {
    this.audio = new Howl({
        src: [audioFilePath],
        loop: options.loop ?? false,
        volume: options.volume ?? 0.1,
    });
    this.isPlaying = false;
  }

  // Play the audio
  play() {
    this.audio.play();
    this.isPlaying = true;
  }

  // Stop the audio
  stop() {
    this.audio.stop();
    this.isPlaying = false;
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.audio.volume(volume);
  }
}
