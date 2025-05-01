import { aud } from "$lib/assets/aud";
import { once } from "@tauri-apps/api/event";
import { on } from "svelte/events";
import { get, writable } from "svelte/store";

export const globalVolumeScale = writable(
	parseFloat(localStorage.getItem("globalVolumeScale") || "1")
);

export const musicVolume = writable(
	parseFloat(localStorage.getItem("musicVolume") || "1")
);

export const sfxVolume = writable(
	parseFloat(localStorage.getItem("sfxVolume") || "1")
);

export const audioManagerRegistry: Set<AudioManager> = new Set();

globalVolumeScale.subscribe((value) => {
	console.log("Global volume scale updated:", value);
	localStorage.setItem("globalVolumeScale", value.toString());
});

musicVolume.subscribe((value) => {
	console.log("Music volume updated:", value);
	localStorage.setItem("musicVolume", value.toString());
	audioManagerRegistry.forEach((manager) => manager.updateAllVolumes());
});

sfxVolume.subscribe((value) => {
	console.log("SFX volume updated:", value);
	localStorage.setItem("sfxVolume", value.toString());
	audioManagerRegistry.forEach((manager) => manager.updateAllVolumes());
});

export class AudioManager {
	SFX: Map<string, HTMLAudioElement[]> = new Map();
	ambience: Map<string, HTMLAudioElement> = new Map();
	music: Map<string, HTMLAudioElement> = new Map();
	bgMusic: HTMLAudioElement[] = [];
    audioEffects: Map<HTMLAudioElement, {task: number, callback: ((cancelled: boolean) => void) | undefined}> = new Map();

	sfxVolume: number = 1;
	ambienceVolume: number = 0.25;
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
            this.audioEffects.clear();
	}

	// Helper to apply global and specific volume scales
	applyVolumeScale(volume: number, type: "music" | "sfx" | "ambience"): number {
			if (type === "ambience") {
					return volume * get(globalVolumeScale) * get(musicVolume) * this.ambienceVolume;
			}
			const specificVolume = type === "music" ? get(musicVolume) : get(sfxVolume);
			return volume * get(globalVolumeScale) * specificVolume;
	}

	// Update the volume of all currently playing audio
	updateAllVolumes() {
			for (let audios of this.SFX.values()) {
					audios.forEach((audio) => {
							if (!audio.paused) {
									audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx");
							}
					});
			}
			for (let audio of this.ambience.values()) {
					if (!audio.paused) {
							audio.volume = this.applyVolumeScale(this.ambienceVolume, "ambience");
					}
			}
			for (let audio of this.music.values()) {
					if (!audio.paused) {
							audio.volume = this.applyVolumeScale(this.musicVolume, "music");
					}
			}
			this.bgMusic.forEach((audio) => {
					if (!audio.paused) {
							audio.volume = this.applyVolumeScale(this.musicVolume, "music");
					}
			});
	}

	// Mutes all audio and clears all audio effects
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
            for (let [audio, task] of this.audioEffects.entries()) {
                // No need to clear the interval as it will be cleared in the task when the audio is paused or ended
                audio?.pause();
                this.audioEffects.delete(audio);
            }
	}

	// Unmutes all audio
	enableAudio() {
			for (let audios of this.SFX.values()) {
					audios.forEach((audio) => (audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx")));
			}
			for (let audio of this.ambience.values()) {
					audio.volume = this.applyVolumeScale(this.ambienceVolume, "music");
			}
			for (let audio of this.music.values()) {
					audio.volume = this.applyVolumeScale(this.musicVolume, "music");
			}
			this.bgMusic.forEach((audio) => (audio.volume = this.applyVolumeScale(this.musicVolume, "music")));
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
					audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx"); // Applies globalVolumeScale
					audio.currentTime = 0;
					audio.play();
			} else if (this.music.has(name)) {
					const audio = this.music.get(name)!;
					audio.volume = this.applyVolumeScale(this.musicVolume, "music"); // Applies globalVolumeScale
					audio.play();
			} else if (this.ambience.has(name)) {
					const audio = this.ambience.get(name)!;
					audio.volume = this.applyVolumeScale(this.ambienceVolume, "music"); // Applies globalVolumeScale
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
                if (this.audioEffects.has(audio)) {
                    this.cancelFadeAudio(name);
                }
				audio.volume = this.applyVolumeScale(volume, "sfx");
			});
		} else if (this.music.has(name)) {
			const audio = this.music.get(name)!;
            if (this.audioEffects.has(audio)) {
                this.cancelFadeAudio(name);
            }
			audio.volume = this.applyVolumeScale(volume, "music");
		} else if (this.ambience.has(name)) {
			const audio = this.ambience.get(name)!;
            if (this.audioEffects.has(audio)) {
                this.cancelFadeAudio(name);
            }
			audio.volume = this.applyVolumeScale(volume, "music");
		}
	}

    // Gets the volume of a specific audio asset
    // Returns the volume of the first instance for SFX, or the single instance for music and ambience
    getVolume(name: string): number {
        if (this.SFX.has(name)) {
            const audioInstances = this.SFX.get(name)!;
            return audioInstances[0].volume;
        } else if (this.music.has(name)) {
            const audio = this.music.get(name)!;
            return audio.volume;
        } else if (this.ambience.has(name)) {
            const audio = this.ambience.get(name)!;
            return audio.volume;
        }
        return 0; // Return 0 if the name is not found
    }

    /**
     * Fades the volume of an audio element or a group of audio elements to a target volume over a specified duration.
     * If a fade is already in progress for the same audio, it will be cancelled and the new fade will start
     * from the volume at the time of cancelling.
     * 
     * @param name - The name of the audio element or group to fade. This can refer to SFX, music, or ambience.
     * @param duration - The duration of the fade effect in milliseconds.
     * @param targetVolume - The target volume to fade to, ranging from 0.0 (silent) to 1.0 (full volume).
     * @param onComplete - An optional callback function that is invoked when the fade operation completes.
     *                      The callback receives a boolean indicating whether the fade was cancelled.
     * @returns `true` if the audio element or group was found and the fade operation was initiated, otherwise `false`.
     */
    fadeAudio(name: string, duration: number, targetVolume: number, onComplete?: (cancelled: boolean) => void): boolean {
        let audio: HTMLAudioElement | HTMLAudioElement[] | undefined;
        if (this.SFX.has(name)) {
            audio = this.SFX.get(name)!;
            targetVolume = this.applyVolumeScale(targetVolume, "sfx");
        } else if (this.music.has(name)) {
            audio = this.music.get(name)!;
            targetVolume = this.applyVolumeScale(targetVolume, "music");
        } else if (this.ambience.has(name)) {
            audio = this.ambience.get(name)!;
            targetVolume = this.applyVolumeScale(targetVolume, "ambience");
        }

        if (!audio) return false;
        
        const targetAudio = Array.isArray(audio) ? audio[0] : audio;
		if (this.audioEffects.has(targetAudio)) {
            this.cancelFadeAudio(name);
        }
        
        if (Array.isArray(audio)) {
            audio.forEach((a) => this.fadeAudioInstance(a, duration, targetVolume, onComplete));
        } else {
            this.fadeAudioInstance(audio, duration, targetVolume, onComplete);
        }
        
        return true;
    }
    
    /**
     * Gradually fades the volume of an HTMLAudioElement to a target volume over a specified duration.
     *
     * @param audio - The HTMLAudioElement whose volume will be adjusted.
     * @param duration - The duration of the fade effect in milliseconds.
     * @param targetVolume - The target volume level (between 0.0 and 1.0) to fade to.
     * @param onComplete - An optional callback function that is invoked when the fade operation completes.
     *                      The callback receives a boolean parameter `cancelled`:
     *                      - `true` if the fade was interrupted (e.g., audio paused or ended).
     *                      - `false` if the fade completed successfully.
     *
     * @remarks
     * - The method uses a step-based approach to adjust the volume incrementally.
     * - If the audio is paused, ended, or the volume reaches 0 during the fade, the operation is cancelled.
     * - The method ensures that the volume is set precisely to the target volume when the fade completes.
     * - The `audioEffects` map is used to track ongoing fade tasks and their associated callbacks.
     */
    fadeAudioInstance(audio: HTMLAudioElement, duration: number, targetVolume: number, onComplete?: (cancelled: boolean) => void): void {
        const stepTime = Math.min(duration, 100);
        const initialVolume = audio.volume;
        const volumeStep = (targetVolume - initialVolume) / (duration / stepTime);

        const fadeTask = setInterval(() => {
            // If the audio is paused or ended, clear the interval and remove the task
            if (audio.paused || audio.ended || (initialVolume !== 0 && audio.volume <= 0)) {
                clearInterval(fadeTask);
                this.audioEffects.delete(audio);
                onComplete?.(true);
                return;
            }

            // If the volume is within the audio step, set the volume, clear the interval, and remove the task
            if (Math.abs(audio.volume - targetVolume) < Math.abs(volumeStep)) {
                audio.volume = targetVolume;
                clearInterval(fadeTask);
                this.audioEffects.delete(audio);
                onComplete?.(false);
            } else {
                audio.volume += volumeStep;
            }
        }, stepTime);
		this.audioEffects.set(audio, {task: fadeTask, callback: onComplete});
    }

    /**
     * Cancels any ongoing fade effect for the specified audio by its name.
     * This method clears the fade interval and invokes the associated callback
     * (if any) with a `true` value to indicate the cancellation. The volume of the audio
     * will not be changed further, and the audio will continue playing at the partially faded volume.
     * This means that you should set the volume to the desired level after calling this method.
     *
     * @param name - The name of the audio effect, music, or ambience to cancel the fade for.
     *
     * The method checks the following collections in order:
     * - `SFX`: If the name exists in the sound effects collection, it cancels the fade for all instances of the audio.
     * - `music`: If the name exists in the music collection, it cancels the fade for the corresponding audio.
     * - `ambience`: If the name exists in the ambience collection, it cancels the fade for the corresponding audio.
     *
     * If the specified name does not exist in any of the collections, no action is taken.
     */
    cancelFadeAudio(name: string) {
        const clearFade = (audio: HTMLAudioElement) => {
          if (audio && this.audioEffects.has(audio)) {
            const { task, callback } = this.audioEffects.get(audio)!;
            this.audioEffects.delete(audio);
            clearInterval(task);
            callback?.(true);
          }
        };

        if (this.SFX.has(name)) {
            const audioInstances = this.SFX.get(name)!;
            audioInstances.forEach((audio) => {
                clearFade(audio);
            });
        } else if (this.music.has(name)) {
            const audio = this.music.get(name)!;
            clearFade(audio);
        } else if (this.ambience.has(name)) {
            const audio = this.ambience.get(name)!;
            clearFade(audio);
        }
    }
}

export function cleanupAudioManagers(activeAudioManager: AudioManager) {
    console.log("Cleaning up audio managers");
    console.log("Active audio manager:", activeAudioManager);
	logAudioManagers();
    for (const manager of audioManagerRegistry) {
        if (manager !== activeAudioManager) {
            console.log("Destroying audio manager:", manager);
            manager.destroy();
		}
	}
    logAudioManagers();
}

export function logAudioManagers() {
	console.log("Active AudioManagers:", audioManagerRegistry.size);
	for (const manager of audioManagerRegistry) {
		console.log(manager);
	}
}