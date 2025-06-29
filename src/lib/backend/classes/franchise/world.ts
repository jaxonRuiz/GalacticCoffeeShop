import { get, type Writable, writable } from "svelte/store";
import { Franchise } from "./franchise";
import { Country } from "./country";
import { dictProxy } from "$lib/backend/proxies";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";

export class World implements ISubscriber, IWorld {
	w_countries: Writable<{ [key: string]: any }> = writable({});
	franchise: Franchise;
	audioManager: AudioManager;

	get countries() {
		return dictProxy(this.w_countries);
	}
	set countries(value: { [key: string]: Country }) {
		this.w_countries.set(value);
	}

	// maybe represent countries locations in relation to each other?
	// if so that would require a graph representation.

	constructor(franchise: Franchise) {
		this.franchise = franchise;
		this.audioManager = franchise.audioManager;
		this.initializeCountries(4 + Math.floor(Math.random() * 2));

		//audio
		this.audioManager = franchise.audioManager;
	}

	initializeCountries(count: number) {
		let created = 0;

		while (created <= count) {
			const newCoords: [number, number] = [
				Math.floor(Math.random() * 1000),
				Math.floor(Math.random() * 1000),
			];

			const isSpaced = Object.keys(this.countries).every((key) => {
				const country = this.countries[key];
				const [x1, y1] = country.coordinates;
				const [x2, y2] = newCoords;
				const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
				return distance >= 100;
			});

			if (isSpaced) {
				created++;
				var countryName = `country ${created}`;
				var newCountry = new Country(this, this.franchise, newCoords, Math.floor(Math.random() * 200), created);
				this.countries[countryName] = newCountry;
			}
		}
	}

	notify(event: string, data?: any) {
	}

	tick() {
		for (const countryKey in this.countries) {
			const country = this.countries[countryKey];
			country.tick();
		}
	}

	hour() {
		for (const countryKey in this.countries) {
			const country = this.countries[countryKey];
			country.hour();
		}
	}

	day() {
		for (const countryKey in this.countries) {
			const country = this.countries[countryKey];
			country.day();
		}
	}

	// may want to move this function elsewhere but we'll see.
	selectCountry(countryName: string) {
		if (this.countries[countryName]) {
			this.franchise.currentCountry = this.countries[countryName];
			this.franchise.currentRegion = null;
		}
	}
}
