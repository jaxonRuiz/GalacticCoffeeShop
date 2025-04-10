import { get, writable } from "svelte/store";

export const globalVolumeScale = writable(
  parseFloat(localStorage.getItem("globalVolumeScale") || "1")
);

globalVolumeScale.subscribe((value) => {
  console.log("Global volume scale updated:", value);
  localStorage.setItem("globalVolumeScale", value.toString());
});

export const audioManagerRegistry: Set<AudioManager> = new Set();

export class AudioManager {
  SFX: Map<string, HTMLAudioElement[]> = new Map();
  ambience: Map<string, HTMLAudioElement> = new Map();
  music: Map<string, HTMLAudioElement> = new Map();
  bgMusic: HTMLAudioElement[] = [];

  sfxVolume: number = 1;
  ambienceVolume: number = 1;
  musicVolume: number = 1;

  constructor() {
    // Register this instance in the global registry
    audioManagerRegistry.add(this);

    // Subscribe to globalVolumeScale changes
    globalVolumeScale.subscribe(() => {
      this.updateAllVolumes();
    });
  }

  destroy() {
    // Remove this instance from the registry
    audioManagerRegistry.delete(this);

    // Stop all audio and clear resources
    this.disableAudio();
    this.SFX.clear();
    this.ambience.clear();
    this.music.clear();
    this.bgMusic = [];
  }

  // Helper to apply global volume scale
  applyVolumeScale(volume: number): number {
    return volume * get(globalVolumeScale);
  }

  // Update the volume of all currently playing audio
  updateAllVolumes() {
    for (let audios of this.SFX.values()) {
      audios.forEach((audio) => {
        if (!audio.paused) {
          audio.volume = this.applyVolumeScale(this.sfxVolume);
        }
      });
    }
    for (let audio of this.ambience.values()) {
      if (!audio.paused) {
        audio.volume = this.applyVolumeScale(this.ambienceVolume);
      }
    }
    for (let audio of this.music.values()) {
      if (!audio.paused) {
        audio.volume = this.applyVolumeScale(this.musicVolume);
      }
    }
    this.bgMusic.forEach((audio) => {
      if (!audio.paused) {
        audio.volume = this.applyVolumeScale(this.musicVolume);
      }
    });
  }

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
      audios.forEach((audio) => (audio.volume = this.applyVolumeScale(this.sfxVolume)));
    }
    for (let audio of this.ambience.values()) {
      audio.volume = this.applyVolumeScale(this.ambienceVolume);
    }
    for (let audio of this.music.values()) {
      audio.volume = this.applyVolumeScale(this.musicVolume);
    }
    this.bgMusic.forEach((audio) => (audio.volume = this.applyVolumeScale(this.musicVolume)));
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
      audio.volume = this.applyVolumeScale(this.sfxVolume); // Applies globalVolumeScale
      audio.currentTime = 0;
      audio.play();
    } else if (this.music.has(name)) {
      const audio = this.music.get(name)!;
      audio.volume = this.applyVolumeScale(this.musicVolume); // Applies globalVolumeScale
      audio.play();
    } else if (this.ambience.has(name)) {
      const audio = this.ambience.get(name)!;
      audio.volume = this.applyVolumeScale(this.ambienceVolume); // Applies globalVolumeScale
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
        audio.volume = this.applyVolumeScale(volume);
      });
    } else if (this.music.has(name)) {
      const audio = this.music.get(name)!;
      audio.volume = this.applyVolumeScale(volume);
    } else if (this.ambience.has(name)) {
      const audio = this.ambience.get(name)!;
      audio.volume = this.applyVolumeScale(volume);
    }
  }
}

export function cleanupAudioManagers(activeAudioManager: AudioManager) {
  for (const manager of audioManagerRegistry) {
    if (manager !== activeAudioManager) {
      manager.destroy();
    }
  }
}

export function logAudioManagers() {
  console.log("Active AudioManagers:", audioManagerRegistry.size);
  for (const manager of audioManagerRegistry) {
    console.log(manager);
  }
}