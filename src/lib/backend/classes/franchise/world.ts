import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../shop";
import { UpgradeManager } from "../../systems/upgradeManager";
import { AudioManager, cleanupAudioManagers } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";
import { Franchise } from "./franchise";
import { Country } from "./country";

export class World implements ISubscriber, IWorld {
	countries: { [key: string]: any } = {};
	franchise: Franchise;

	// maybe represent countries locations in relation to each other?
	// if so that would require a graph representation.

	constructor(franchise: Franchise) {
		this.franchise = franchise;
		this.initializeCountries(5);
	}

	initializeCountries(count: number) {
		let created = 0;

		while (created < count) {
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
				const countryName = `country ${created + 1}`;

				const newCountry = new Country(this, this.franchise, newCoords);

				this.countries[countryName] = newCountry;
				created++;
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

	// may want to move this function elsewhere but we'll see.
	selectCountry(countryName: string) {
		if (this.countries[countryName]) {
			this.franchise.currentCountry = this.countries[countryName];
			this.franchise.currentRegion = null;
		}
	}
}
