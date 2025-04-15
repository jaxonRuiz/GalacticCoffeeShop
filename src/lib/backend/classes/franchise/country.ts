import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../shop";
import { UpgradeManager } from "../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";
import type { World } from "./world";
import { Region } from "./region";
import { Franchise } from "./franchise";

export class Country{
	parent: World;
	taxRate: number = 0.2;
	tariffRate: number = 0.1;

	// modifiers represent taxes and subsidies. scaler to development building costs
	farmModifier: number = 1.0;
	shopModifier: number = 1.0;
	housingModifier: number = 1.0;
	coordinates: [number, number];
	franchise: Franchise;
	
	regionList: Region[] = [];
	// need to figure out how to represent regions in a graph


	constructor(parent: World, franchise: Franchise, coordinates: [number, number]) {
		this.parent = parent;
		this.coordinates = coordinates;
		this.franchise = franchise;

		this.InitializeRegions(10);
	}

	tick(){
		for (const region of this.regionList) {
			region.tick();
		}
	}

	InitializeRegions(count: number){
		while (this.regionList.length < count) {
			const newCoords: [number, number] = [
				Math.floor(Math.random() * 1000),
				Math.floor(Math.random() * 1000)
			];

			// Check if newCoords are far enough from all existing regions
			const isSpaced = this.regionList.every(region => {
				const [x1, y1] = region.coordinates;
				const [x2, y2] = newCoords;
				const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
				return distance >= 100;
			});

			if (isSpaced) {
				var newRegion = new Region(this.franchise.timer, this, this.franchise, 90 + Math.floor(Math.random() * 30), 2000 * Math.floor(Math.random() * 1000), Math.floor(Math.random() * 3.99), newCoords);
				this.regionList.push(newRegion);
			}
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