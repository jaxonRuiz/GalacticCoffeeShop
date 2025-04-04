export class AudioManager {
  SFX: Map<string, HTMLAudioElement[]> = new Map();
  ambience: Map<string, HTMLAudioElement> = new Map();
  music: Map<string, HTMLAudioElement> = new Map();
  bgMusic: HTMLAudioElement[] = [];

  sfxVolume: number = 1;
  ambienceVolume: number = 1;
  musicVolume: number = 1;

  constructor() {}

  // Mutes all audio
  disableAudio() {
    for (let audios of this.SFX.values()) {
      audios.forEach((audio) => (audio.volume = 0));
    }
    for (let audio of this.ambience.values()) {
      audio.volume = 0;
    }
    for (let audio of this.music.values()) {
      audio.volume = 0;
    }
    this.bgMusic.forEach((audio) => (audio.volume = 0));
  }

  // Unmutes all audio
  enableAudio() {
    for (let audios of this.SFX.values()) {
      audios.forEach((audio) => (audio.volume = this.sfxVolume));
    }
    for (let audio of this.ambience.values()) {
      audio.volume = this.ambienceVolume;
    }
    for (let audio of this.music.values()) {
      audio.volume = this.musicVolume;
    }
    this.bgMusic.forEach((audio) => (audio.volume = this.musicVolume));
  }

  // Adds sound effects (can overlap)
  addSFX(name: string, path: string) {
    const audioInstances = [new Audio(path), new Audio(path), new Audio(path)];
    this.SFX.set(name, audioInstances);
  }

  // Adds background music
  addMusic(name: string, path: string) {
    const audio = new Audio(path);
    audio.loop = true;
    this.music.set(name, audio);
  }

  // Adds ambience audio
  addAmbience(name: string, path: string) {
    const audio = new Audio(path);
    audio.loop = true;
    this.ambience.set(name, audio);
  }

  // Plays a specific audio asset
  playAudio(name: string) {
    if (this.SFX.has(name)) {
      const audioInstances = this.SFX.get(name)!;
      const audio = audioInstances.find((a) => a.paused) || audioInstances[0];
      audio.volume = this.sfxVolume;
      audio.currentTime = 0;
      audio.play();
    } else if (this.music.has(name)) {
      const audio = this.music.get(name)!;
      audio.volume = this.musicVolume;
      audio.play();
    } else if (this.ambience.has(name)) {
      const audio = this.ambience.get(name)!;
      audio.volume = this.ambienceVolume;
      audio.play();
    }
  }

  // Stops a specific audio asset
  stopAudio(name: string) {
    if (this.SFX.has(name)) {
      const audioInstances = this.SFX.get(name)!;
      audioInstances.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    } else if (this.music.has(name)) {
      const audio = this.music.get(name)!;
      audio.pause();
      audio.currentTime = 0;
    } else if (this.ambience.has(name)) {
      const audio = this.ambience.get(name)!;
      audio.pause();
      audio.currentTime = 0;
    }
  }

  // Sets the volume of a specific audio asset
  setVolume(name: string, volume: number) {
    volume = Math.max(0, Math.min(1, volume)); // Ensure volume is between 0 and 1

    if (this.SFX.has(name)) {
      const audioInstances = this.SFX.get(name)!;
      audioInstances.forEach((audio) => {
        audio.volume = volume;
      });
    } else if (this.music.has(name)) {
      const audio = this.music.get(name)!;
      audio.volume = volume;
    } else if (this.ambience.has(name)) {
      const audio = this.ambience.get(name)!;
      audio.volume = volume;
    }
  }
}
