import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../shop";
import { UpgradeManager } from "../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";
import type { World } from "./world";

export class Country implements ISubscriber, ICountry{
    
	// parent: World;
  	// taxRate: number;
  	// tariffRate: number;
  	// regionList: Region[];

    notify(event: string, data?: any) {
		// maybe optimize better :/ dont need to call every shop every tick
		if (event === "tick") {
			this.tick();
		}
		if (event === "day") {
			
		}
		if (event === "week") {
			
		}
	}

    tick(){

    }
}