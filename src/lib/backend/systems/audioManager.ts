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
	audioEffects: Map<HTMLAudioElement, { task: number, callback: ((cancelled: boolean) => void) | undefined }> = new Map();

	sfxVolume: number = 1;
	ambienceVolume: number = 0.25;
	musicVolume: number = 1;
	maxVolumeScales: Map<string, number> = new Map();

	constructor() {
		// Register this instance in the global registry
		audioManagerRegistry.add(this);

		// Subscribe to globalVolumeScale changes
		globalVolumeScale.subscribe(() => {
			this.updateAllVolumes();
		});
	}

	// --- Playback Controls ---
	playAudio(name: string) {
		if (this.SFX.has(name)) {
			const audioInstances = this.SFX.get(name)!;
			let audio = audioInstances.find((a) => a.paused);
			if (!audio) {
				// All are playing, forcibly reset the first one
				audio = audioInstances[0];
				audio.pause();
				audio.currentTime = 0;
			}
			audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx", audio.name);
			audio.currentTime = 0;
			audio.play();
		} else if (this.music.has(name)) {
			const audio = this.music.get(name)!;
			audio.volume = this.applyVolumeScale(this.musicVolume, "music", audio.name); // Applies globalVolumeScale
			audio.play();
		} else if (this.ambience.has(name)) {
			const audio = this.ambience.get(name)!;
			audio.volume = this.applyVolumeScale(this.ambienceVolume, "ambience", audio.name); // Applies globalVolumeScale
			audio.play();
		}
	}

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
	setVolume(name: string, volume: number) {
		volume = Math.max(0, Math.min(1, volume)); // Ensure volume is between 0 and 1

		if (this.SFX.has(name)) {
			const audioInstances = this.SFX.get(name)!;
			audioInstances.forEach((audio) => {
				if (this.audioEffects.has(audio)) {
					this.cancelFadeAudio(name);
				}
				audio.volume = this.applyVolumeScale(volume, "sfx", audio.name);
			});
		} else if (this.music.has(name)) {
			const audio = this.music.get(name)!;
			if (this.audioEffects.has(audio)) {
				this.cancelFadeAudio(name);
			}
			audio.volume = this.applyVolumeScale(volume, "music", audio.name);
		} else if (this.ambience.has(name)) {
			const audio = this.ambience.get(name)!;
			if (this.audioEffects.has(audio)) {
				this.cancelFadeAudio(name);
			}
			audio.volume = this.applyVolumeScale(volume, "music", audio.name);
		}
	}

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

	updateAllVolumes() {
		for (let audios of this.SFX.values()) {
			audios.forEach((audio) => {
				if (!audio.paused) {
					audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx", audio.name);
				}
			});
		}
		for (let audio of this.ambience.values()) {
			if (!audio.paused) {
				audio.volume = this.applyVolumeScale(this.ambienceVolume, "ambience", audio.name);
			}
		}
		for (let audio of this.music.values()) {
			if (!audio.paused) {
				audio.volume = this.applyVolumeScale(this.musicVolume, "music", audio.name);
			}
		}
		this.bgMusic.forEach((audio) => {
			if (!audio.paused) {
				audio.volume = this.applyVolumeScale(this.musicVolume, "music", audio.name);
			}
		});
	}

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
	fadeAudio(name: string, duration: number, targetVolume: number, onComplete?: (cancelled: boolean) => void): boolean {
		let audio: HTMLAudioElement | HTMLAudioElement[] | undefined;
		if (this.SFX.has(name)) {
			audio = this.SFX.get(name)!;
			targetVolume = this.applyVolumeScale(targetVolume, "sfx", audio);
		} else if (this.music.has(name)) {
			audio = this.music.get(name)!;
			targetVolume = this.applyVolumeScale(targetVolume, "music", audio);
		} else if (this.ambience.has(name)) {
			audio = this.ambience.get(name)!;
			targetVolume = this.applyVolumeScale(targetVolume, "ambience", audio);
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
	addSFX(name: string, path: string) {
		const audioInstances = [new Audio(path), new Audio(path), new Audio(path)];
		audioInstances.forEach(audio => audio.name = name);
		this.SFX.set(name, audioInstances);
	}

	addMusic(name: string, path: string) {
		const audio = new Audio(path);
		audio.loop = true;
		audio.name = name;
		this.music.set(name, audio);
	}

	addAmbience(name: string, path: string) {
		const audio = new Audio(path);
		audio.loop = true;
		audio.name = name;
		this.ambience.set(name, audio);
	}

	setMaxVolumeScale(name: string, scale: number) {
		this.maxVolumeScales.set(name, Math.max(0, Math.min(1, scale)));
	}

	// --- Enable/Disable/Cleanup ---
	enableAudio() {
		for (let audios of this.SFX.values()) {
			audios.forEach((audio) => (audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx", audio.name)));
		}
		for (let audio of this.ambience.values()) {
			audio.volume = this.applyVolumeScale(this.ambienceVolume, "ambience", audio.name);
		}
		for (let audio of this.music.values()) {
			audio.volume = this.applyVolumeScale(this.musicVolume, "music", audio.name);
		}
		this.bgMusic.forEach((audio) => (audio.volume = this.applyVolumeScale(this.musicVolume, "music", audio.name)));
	}

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