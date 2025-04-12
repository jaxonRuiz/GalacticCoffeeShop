import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../shop";
import { UpgradeManager } from "../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";

export class World implements ISubscriber, IWorld{
	

	countries: { [key: string]: any } = {};
	// maybe represent countries locations in relation to each other?
	// if so that would require a graph representation.

	constructor() {

	}

	notify(event: string, data?: any) {

	}

	tick(){
		for (const countryKey in this.countries) {
			const country = this.countries[countryKey];
			country.tick();
		}
	}
}