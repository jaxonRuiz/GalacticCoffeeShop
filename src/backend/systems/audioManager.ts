export class AudioManager {
  SFX: Map<string, HTMLAudioElement[]> = new Map();
  ambience: Map<string, HTMLAudioElement> = new Map();
  music: Map<string, HTMLAudioElement> = new Map();
  bgMusic: HTMLAudioElement[] = [];

  sfcVolume: number = 1;
  ambienceVolume: number = 1;
  musicVolume: number = 1;

  constructor() {

  }


  disableAudio() {
    for (let [key, value] of this.SFX) {
      value.forEach(audio => {
        audio.volume = 0;
      });
    }
    for (let [key, value] of this.ambience) {
      value.volume = 0;
    }
    for (let [key, value] of this.music) {
      value.volume = 0;
    }
  }

  enableAudio() {
    for (let [key, value] of this.SFX) {
      value.forEach(audio => {
        audio.volume = this.sfcVolume;
      });
    }
    for (let [key, value] of this.ambience) {
      value.volume = this.ambienceVolume;
    }
    for (let [key, value] of this.music) {
      value.volume = this.musicVolume;
    }
  }

  addSFX(name: string, path: string) {
    const audio1 = new Audio(path);
    const audio2 = new Audio(path);
    const audio3 = new Audio(path);
    this.SFX.set(name, [audio1, audio2, audio3]);
  }

  addMusic(name: string, path: string) {
    const audio = new Audio(path);
    // this.music.set(name, audio);
    this.bgMusic.push(audio);
  }

  addAmbience(name: string, path: string) {
  }

  playSFX(name: string) {
    let audioset = this.SFX.get(name)!;
    audioset[0].play();
  }


}