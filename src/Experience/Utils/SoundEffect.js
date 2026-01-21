import { Howl } from 'howler';

export default class SoundEffect {
  constructor(audioFilePath) {
    this.audio = new Howl({
        src: [audioFilePath],
        loop: false,
        volume: 0.1,
    });
    this.isPlaying = false;
  }

  // Play the audio
  play() {
    this.audio.play();
  }
}
