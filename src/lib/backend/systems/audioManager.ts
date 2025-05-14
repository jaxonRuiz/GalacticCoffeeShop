import { aud } from "$lib/assets/aud";
import { once } from "@tauri-apps/api/event";
import { on } from "svelte/events";
import { get, writable } from "svelte/store";

type NamedAudio = HTMLAudioElement & { name: string };

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
	localStorage.setItem("globalVolumeScale", value.toString());
});

musicVolume.subscribe((value) => {
	localStorage.setItem("musicVolume", value.toString());
	audioManagerRegistry.forEach((manager) => manager.updateAllVolumes());
});

sfxVolume.subscribe((value) => {
	localStorage.setItem("sfxVolume", value.toString());
	audioManagerRegistry.forEach((manager) => manager.updateAllVolumes());
});

export class AudioManager {
	SFX: Map<string, HTMLAudioElement[]> = new Map();
	ambience: Map<string, HTMLAudioElement> = new Map();
	music: Map<string, HTMLAudioElement> = new Map();
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
				audio = audioInstances[0];
				audio.pause();
				audio.currentTime = 0;
			}
			audio.volume = this.applyVolumeScale(this.sfxVolume, "sfx", name);
			audio.currentTime = 0;
			audio.play();
		} else if (this.music.has(name)) {
			const audio = this.music.get(name)!;
			audio.volume = this.applyVolumeScale(this.musicVolume, "music", name);
			audio.play();
		} else if (this.ambience.has(name)) {
			const audio = this.ambience.get(name)!;
			audio.volume = this.applyVolumeScale(this.ambienceVolume, "ambience", name);
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

	applyVolumeScale(volume: number, type: "music" | "sfx" | "ambience", name?: string): number {
		let maxScale = 1;
		if (name && this.maxVolumeScales.has(name)) {
			console.log("applyVolumeScale: found maxVolumeScale for", name, "=", this.maxVolumeScales.get(name));
			maxScale = this.maxVolumeScales.get(name)!;
		} else if (name) {
			console.log("applyVolumeScale: NO maxVolumeScale for", name);
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
		// Check if name is already used
		if (this.SFX.has(name) || this.music.has(name) || this.ambience.has(name)) {
			console.warn(`Audio name "${name}" is already used.`);
			return;
		}
		// Check if path is already used
		for (const audios of this.SFX.values()) {
			if (audios.some(audio => audio.src === path)) {
				console.warn(`Audio path "${path}" is already used in SFX.`);
				return;
			}
		}
		for (const audio of this.music.values()) {
			if (audio.src === path) {
				console.warn(`Audio path "${path}" is already used in music.`);
				return;
			}
		}
		for (const audio of this.ambience.values()) {
			if (audio.src === path) {
				console.warn(`Audio path "${path}" is already used in ambience.`);
				return;
			}
		}
		const audioInstances = [new Audio(path), new Audio(path), new Audio(path)];
		audioInstances.forEach(audio => (audio as NamedAudio).name = name);
		this.SFX.set(name, audioInstances);
	}

	addMusic(name: string, path: string) {
		if (this.music.has(name) || this.SFX.has(name) || this.ambience.has(name)) {
			console.warn(`Audio name "${name}" is already used.`);
			return;
		}
		for (const audio of this.music.values()) {
			if (audio.src === path) {
				console.warn(`Audio path "${path}" is already used in music.`);
				return;
			}
		}
		for (const audios of this.SFX.values()) {
			if (audios.some(audio => audio.src === path)) {
				console.warn(`Audio path "${path}" is already used in SFX.`);
				return;
			}
		}
		for (const audio of this.ambience.values()) {
			if (audio.src === path) {
				console.warn(`Audio path "${path}" is already used in ambience.`);
				return;
			}
		}
		const audio = new Audio(path) as NamedAudio;
		audio.loop = true;
		audio.name = name;
		this.music.set(name, audio);
	}

	addAmbience(name: string, path: string) {
		if (this.ambience.has(name) || this.SFX.has(name) || this.music.has(name)) {
			console.warn(`Audio name "${name}" is already used.`);
			return;
		}
		for (const audio of this.ambience.values()) {
			if (audio.src === path) {
				console.warn(`Audio path "${path}" is already used in ambience.`);
				return;
			}
		}
		for (const audios of this.SFX.values()) {
			if (audios.some(audio => audio.src === path)) {
				console.warn(`Audio path "${path}" is already used in SFX.`);
				return;
			}
		}
		for (const audio of this.music.values()) {
			if (audio.src === path) {
				console.warn(`Audio path "${path}" is already used in music.`);
				return;
			}
		}
		const audio = new Audio(path) as NamedAudio;
		audio.loop = true;
		audio.name = name;
		this.ambience.set(name, audio);
	}

	setMaxVolumeScale(name: string, scale: number) {
		this.maxVolumeScales.set(name, Math.max(0, Math.min(1, scale)));
	}

	// --- Enable/Disable/Cleanup ---
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

export function cleanupAudioManagers(activeAudioManager: AudioManager) {
	console.log("Cleaning up audio managers");
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