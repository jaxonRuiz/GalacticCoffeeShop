import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../shop";
import { UpgradeManager } from "../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";
import type { World } from "./world";
import type { Region } from "./region";

export class Country{
	parent: World;
	taxRate: number = 0.2;
	tariffRate: number = 0.1;

	// modifiers represent taxes and subsidies. scaler to development building costs
	farmModifier: number = 1.0;
	shopModifier: number = 1.0;
	housingModifier: number = 1.0;
	
	regionList: Region[] = [];
	// need to figure out how to represent regions in a graph


	constructor(parent: World) {
		this.parent = parent;

	}

	tick(){
		for (const region of this.regionList) {
			region.tick();
		}
	}

	ImportBeansTo(numBeans: number, region: Region): number{ //will import as many beans as it can to the target region from all the other available regions
		var beansLeft = numBeans;
		for (const currReg of this.regionList) {
			if (beansLeft == 0) {return 0;}
			if (currReg === region) continue;
			beansLeft = region.ImportBeans(beansLeft, currReg);
		}
		return numBeans - beansLeft; //return the number of beans imported
	}
}