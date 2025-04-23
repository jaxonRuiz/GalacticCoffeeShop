import { get, type Writable, writable } from "svelte/store";
import type { World } from "./world";
import { Region } from "./region";
import { Franchise } from "./franchise";

export class Country{
	parent: World;
	w_taxRate: Writable<number> = writable(0.2);
	w_tariffRate: Writable<number> = writable(0.1);

	get taxRate() {
		return get(this.w_taxRate);
	}
	set taxRate(value) {
		this.w_taxRate.set(value);
	}
	get tariffRate() {
		return get(this.w_tariffRate);
	}
	set tariffRate(value) {
		this.w_tariffRate.set(value);
	}

	// modifiers represent taxes and subsidies. scaler to development building costs
	farmModifier: number = 1.0;
	shopModifier: number = 1.0;
	housingModifier: number = 1.0;
	coordinates: [number, number];
	franchise: Franchise;
	firstRegion: boolean;
	
	w_regionList: Writable<Region[]> = writable([]);
	// need to figure out how to represent regions in a graph
	get regionList() {
		return get(this.w_regionList);
	}
	set regionList(value: Region[]) {
		this.w_regionList.set(value);
	}


	constructor(parent: World, franchise: Franchise, coordinates: [number, number]) {
		this.parent = parent;
		this.coordinates = coordinates;
		this.franchise = franchise;
		this.firstRegion = true;

		this.initializeRegions(10);
	}

	tick(){
		for (const region of this.regionList) {
			region.tick();
		}
	}

	initializeRegions(count: number){
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
				if (this.firstRegion){
					var newRegion = new Region(this.franchise.timer, this, this.franchise, 90 + Math.floor(Math.random() * 30), 2000 * Math.floor(Math.random() * 1000), 2, newCoords);
					this.firstRegion = false;
				}
				else{
					var newRegion = new Region(this.franchise.timer, this, this.franchise, 90 + Math.floor(Math.random() * 30), 2000 * Math.floor(Math.random() * 1000), Math.floor(Math.random() * 3.99), newCoords);
				}
				this.regionList = [...this.regionList, newRegion];
				// this.regionList.push(newRegion);
			}
		}
	}	

	importBeansTo(numBeans: number, region: Region): number{ //will import as many beans as it can to the target region from all the other available regions
		var beansLeft = numBeans;
		for (const currReg of this.regionList) {
			if (beansLeft == 0) {return 0;}
			if (currReg === region) continue;
			beansLeft = region.importBeans(beansLeft, currReg);
		}
		return numBeans - beansLeft; //return the number of beans imported
	}

	unlockRegion(regionIndex: number){
		this.regionList[regionIndex].unlockRegion();
	}
}