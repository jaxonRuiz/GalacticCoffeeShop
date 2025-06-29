import { get, writable } from "svelte/store";

/*
 * NamedAudio extends HTMLAudioElement to include a name property for easier tracking.
 */
type NamedAudio = HTMLAudioElement & { name: string };

/*
 * Global volume controls using Svelte stores.
 * These persist to localStorage and update all registered AudioManagers on change.
 */
export const globalVolumeScale = writable(
	parseFloat(localStorage.getItem("globalVolumeScale") || "1")
);

export const musicVolume = writable(
	parseFloat(localStorage.getItem("musicVolume") || "1")
);

export const sfxVolume = writable(
	parseFloat(localStorage.getItem("sfxVolume") || "1")
);

/*
 * Registry of all active AudioManager instances.
 * Used for global volume and mute/unmute operations.
 */
export const audioManagerRegistry: Set<AudioManager> = new Set();

// Subscribe to global volume changes and update all managers accordingly.
globalVolumeScale.subscribe((value) => {
	localStorage.setItem("globalVolumeScale", value.toString());
	audioManagerRegistry.forEach((manager) => manager.updateAllVolumes());
});

musicVolume.subscribe((value) => {
	localStorage.setItem("musicVolume", value.toString());
	audioManagerRegistry.forEach((manager) => manager.updateAllVolumes());
});

sfxVolume.subscribe((value) => {
	localStorage.setItem("sfxVolume", value.toString());
	audioManagerRegistry.forEach((manager) => manager.updateAllVolumes());
});

/*
 * AudioManager
 * Handles SFX, music, and ambience playback for a all scenes.
 * Registers itself in the global registry on creation and removes itself on destroy.
 */
export class AudioManager {
	SFX: Map<string, HTMLAudioElement[]> = new Map();
	SFXIndex: Map<string, number> = new Map();
	ambience: Map<string, HTMLAudioElement> = new Map();
	music: Map<string, HTMLAudioElement> = new Map();
	audioEffects: Map<HTMLAudioElement, { task: NodeJS.Timeout, callback: ((cancelled: boolean) => void) | undefined }> = new Map();

	sfxVolume: number = 1;
	ambienceVolume: number = 0.25;
	musicVolume: number = 1;
	maxVolumeScales: Map<string, number> = new Map();

	constructor() {
		// Register this instance in the global registry
		audioManagerRegistry.add(this);

		// Subscribe to global volume changes
		globalVolumeScale.subscribe(() => {
			this.updateAllVolumes();
		});
		musicVolume.subscribe(() => {
			this.updateAllVolumes();
		});
		sfxVolume.subscribe(() => {
			this.updateAllVolumes();
		});
	}

	// --- Playback Controls ---

	/*
	 * Play an audio asset by name.
	 * Supports SFX (with round-robin), music, and ambience.
	 */
	playAudio(name: string) {
		try {
			if (this.SFX.has(name)) {
				const audioInstances = this.SFX.get(name);
				if (!audioInstances || audioInstances.length === 0) {
					console.warn(`No SFX audio instances found for "${name}"`);
					return;
				}
				let idx = this.SFXIndex.get(name) ?? 0;
				const audio = audioInstances[idx];
				if (!audio) {
					console.warn(`SFX audio instance at index ${idx} for "${name}" is undefined`);
					return;
				}
				this.SFXIndex.set(name, (idx + 1) % audioInstances.length);
				audio.pause();
				audio.currentTime = 0;
				audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx", name);
				audio.play().catch(e => {
					console.warn(`Failed to play SFX "${name}":`, e);
				});
			} else if (this.music.has(name)) {
				const audio = this.music.get(name);
				if (!audio) {
					console.warn(`Music audio instance for "${name}" is undefined`);
					return;
				}
				audio.volume = this.applyVolumeScale(this.musicVolume, "music", name);
				audio.play().catch(e => {
					console.warn(`Failed to play music "${name}":`, e);
				});
			} else if (this.ambience.has(name)) {
				const audio = this.ambience.get(name);
				if (!audio) {
					console.warn(`Ambience audio instance for "${name}" is undefined`);
					return;
				}
				audio.volume = this.applyVolumeScale(this.ambienceVolume, "ambience", name);
				audio.play().catch(e => {
					console.warn(`Failed to play ambience "${name}":`, e);
				});
			} else {
				console.warn(`Audio "${name}" not found in SFX, music, or ambience.`);
				return;
			}
		} catch (err) {
			console.error(`Error in playAudio("${name}"):`, err);
			return;
		}
	}

	/*
	 * Stop playback and reset an audio asset by name.
	 */
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

	// --- Volume Controls ---

	/*
	 * Set the volume for a specific audio asset.
	 */
	setVolume(name: string, volume: number) {
		volume = Math.max(0, Math.min(1, volume)); // Ensure volume is between 0 and 1

		if (this.SFX.has(name)) {
			const audioInstances = this.SFX.get(name)!;
			audioInstances.forEach((audio) => {
				if (this.audioEffects.has(audio)) {
					this.cancelFadeAudio(name);
				}
				audio.volume = this.applyVolumeScale(volume, "sfx", name);
			});
		} else if (this.music.has(name)) {
			const audio = this.music.get(name)!;
			if (this.audioEffects.has(audio)) {
				this.cancelFadeAudio(name);
			}
			audio.volume = this.applyVolumeScale(volume, "music", name);
		} else if (this.ambience.has(name)) {
			const audio = this.ambience.get(name)!;
			if (this.audioEffects.has(audio)) {
				this.cancelFadeAudio(name);
			}
			audio.volume = this.applyVolumeScale(volume, "ambience", name);
		}
	}

	/*
	 * Get the current volume for a specific audio asset.
	 */
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

	/*
	 * Update all audio volumes based on current global and type-specific settings.
	 */
	updateAllVolumes() {
		for (let [name, audios] of this.SFX.entries()) {
			audios.forEach((audio) => {
				if (!audio.paused) {
					audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx", name);
				}
			});
		}
		for (let [name, audio] of this.ambience.entries()) {
			if (!audio.paused) {
				audio.volume = this.applyVolumeScale(this.ambienceVolume, "ambience", name);
			}
		}
		for (let [name, audio] of this.music.entries()) {
			if (!audio.paused) {
				audio.volume = this.applyVolumeScale(this.musicVolume, "music", name);
			}
		}
	}

	/*
	 * Calculate the effective volume for an audio asset, applying all relevant scales.
	 */
	applyVolumeScale(volume: number, type: "music" | "sfx" | "ambience", name?: string): number {
		let maxScale = 1;
		if (name && this.maxVolumeScales.has(name)) {
			maxScale = this.maxVolumeScales.get(name)!;
		}
		if (type === "ambience") {
			return Math.min(volume * get(globalVolumeScale) * get(musicVolume) * this.ambienceVolume, maxScale);
		}
		const specificVolume = type === "music" ? get(musicVolume) : get(sfxVolume);
		return Math.min(volume * get(globalVolumeScale) * specificVolume, maxScale);
	}

	// --- Fade and Cancel Fade ---

	/*
	 * Fade an audio asset to a target volume over a duration.
	 */
	fadeAudio(name: string, duration: number, targetVolume: number, onComplete?: (cancelled: boolean) => void): boolean {
		let audio: HTMLAudioElement | HTMLAudioElement[] | undefined;
		if (this.SFX.has(name)) {
			audio = this.SFX.get(name)!;
			targetVolume = this.applyVolumeScale(targetVolume, "sfx", name);
		} else if (this.music.has(name)) {
			audio = this.music.get(name)!;
			targetVolume = this.applyVolumeScale(targetVolume, "music", name);
		} else if (this.ambience.has(name)) {
			audio = this.ambience.get(name)!;
			targetVolume = this.applyVolumeScale(targetVolume, "ambience", name);
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

	/*
	 * Helper for fading a single audio instance.
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
		this.audioEffects.set(audio, { task: fadeTask, callback: onComplete });
	}

	/*
	 * Cancel any ongoing fade for a given audio asset.
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

	// --- Add/Remove Audio Assets ---

	/*
	 * Register a new SFX asset with multiple instances for overlapping playback.
	 */
	addSFX(name: string, path: string) {
		const audioInstances = [new Audio(path), new Audio(path), new Audio(path)];
		audioInstances.forEach(audio => (audio as NamedAudio).name = name);
		this.SFX.set(name, audioInstances);
	}

	/*
	 * Register a new music asset.
	 */
	addMusic(name: string, path: string) {
		const audio = new Audio(path) as NamedAudio;
		audio.loop = true;
		audio.name = name;
		this.music.set(name, audio);
	}

	/*
	 * Register a new ambience asset.
	 */
	addAmbience(name: string, path: string) {
		const audio = new Audio(path) as NamedAudio;
		audio.loop = true;
		audio.name = name;
		this.ambience.set(name, audio);
	}

	/*
	 * Set a maximum volume scale for a specific audio asset.
	 */
	setMaxVolumeScale(name: string, scale: number) {
		this.maxVolumeScales.set(name, Math.max(0, Math.min(1, scale)));
	}

	// --- Enable/Disable/Cleanup ---

	/*
	 * Restore all audio volumes to their configured levels.
	 */
	enableAudio() {
		for (let [name, audios] of this.SFX.entries()) {
			audios.forEach((audio) => (audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx", name)));
		}
		for (let [name, audio] of this.ambience.entries()) {
			audio.volume = this.applyVolumeScale(this.ambienceVolume, "ambience", name);
		}
		for (let [name, audio] of this.music.entries()) {
			audio.volume = this.applyVolumeScale(this.musicVolume, "music", name);
		}
	}

	/*
	 * Mute all audio by setting volume to zero.
	 */
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
		for (let [audio, task] of this.audioEffects.entries()) {
			audio?.pause();
			this.audioEffects.delete(audio);
		}
	}

	/*
	 * Resume music and ambience playback if paused, and restore volumes.
	 */
	resumeAudio() {
		// Resume music
		for (let audio of this.music.values()) {
			if (audio.paused) {
				audio.play().catch(() => { });
			}
		}
		// Resume ambience
		for (let audio of this.ambience.values()) {
			if (audio.paused) {
				audio.play().catch(() => { });
			}
		}
		// Restore volumes
		this.enableAudio();
	}

	/*
	 * Destroy this AudioManager, remove from registry, and clear all resources.
	 */
	destroy() {
		// Remove this instance from the registry
		audioManagerRegistry.delete(this);

		// Stop all audio and clear resources
		this.disableAudio();
		this.SFX.clear();
		this.ambience.clear();
		this.music.clear();
		this.audioEffects.clear();
	}
}

/*
 * Destroy all AudioManagers except the optionally provided active one.
 * Use this when switching scenes to prevent audio conflicts and memory leaks.
 */
export function cleanupAudioManagers(activeAudioManager?: AudioManager) {
	console.log("Cleaning up audio managers");
	// Create a copy to avoid modifying the set while iterating
	const managers = Array.from(audioManagerRegistry);
	for (const manager of managers) {
		// If an active manager is provided, skip it, otherwise, destroy all
		if (!activeAudioManager || manager !== activeAudioManager) {
			manager.destroy();
		}
	}
}

/*
 * Log all currently active AudioManagers for debugging.
 */
export function logAudioManagers() {
	console.log("Active AudioManagers:", audioManagerRegistry.size);
	for (const manager of audioManagerRegistry) {
		console.log(manager);
	}
}