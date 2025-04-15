import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../shop";
import { UpgradeManager } from "../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";
import { DevelopmentBase, DevelopmentType } from "./developments/developmentbase";
import type { Country } from "./country";
//import { dev } from "$app/environment";
import { Residential } from "./developments/residential";
import { Franchise } from "./franchise";
import { Farm } from "./developments/farm";
import { LogisticCenter } from "./developments/logisticCenter";

export enum ClimateType {
	Arid = 0,
	Wintry = 1,
	Temperate = 2,
	Tropical = 3,
}

export class Region implements ISubscriber, IRegion {
	//writables
	w_totalArea: Writable<number> = writable(100);
	w_unusedLand: Writable<number> = writable(100);
	w_developmentList: Writable<{ [key: string]: DevelopmentBase }> = writable({
		// developments should be predefined, but set with area size of zero.
	});
	w_environmentalFactors: Writable<{ [key: string]: number }> = writable({
		soilRichness: 1,
		waterAvailability: 1,
		averageTemp: 1,
	});
	w_accessibilityLevel: Writable<number> = writable(10);
	w_importCapacity: Writable<number> = writable(1000);
	w_exportCapacity: Writable<number> = writable(1000);
	w_beans: Writable<number> = writable(0);

	//getters and setters
	get totalArea() {
		return get(this.w_totalArea);
	}
	set totalArea(value) {
		this.w_totalArea.set(value);
	}
	get developmentList() {
		return get(this.w_developmentList);
	}
	set developmentList(value: { [key: string]: DevelopmentBase }) {
		this.w_developmentList.set(value);
	}
	get environmentalFactors() {
		return get(this.w_environmentalFactors);
	}
	set environmentalFactors(value: { [key: string]: number }) {
		this.w_environmentalFactors.set(value);
	}
	get accessibilityLevel() {
		return get(this.w_accessibilityLevel);
	}
	set accessibilityLevel(value) {
		this.w_accessibilityLevel.set(value);
	}
	get importCapacity() {
		return get(this.w_importCapacity);
	}
	set importCapacity(value) {
		this.w_importCapacity.set(value);
	}
	get exportCapacity() {
		return get(this.w_exportCapacity);
	}
	set exportCapacity(value) {
		this.w_exportCapacity.set(value);
	}
	get unusedLand() {
		return get(this.w_unusedLand);
	}
	set unusedLand(value) {
		this.w_unusedLand.set(value);
	}
	get beans(){
		return get(this.w_beans);
	}
	set beans(value){
		this.w_beans.set(value);
	}

	//internal variables
	dailyImport: number = this.importCapacity;
	dailyExport: number = this.exportCapacity;
	unlockCost: number;
	coordinates: [number, number];
	
	timer: Publisher;
	parentCountry: Country;
	franchise: Franchise;

	constructor(timer: Publisher, country: Country, franchise: Franchise, areaSize: number, cost: number, climate: ClimateType, coordinates: [number, number]) {
		timer.subscribe(this, "tick");
		timer.subscribe(this, "hour");
		timer.subscribe(this, "week");
		this.parentCountry = country;
		this.totalArea = areaSize;
		this.unlockCost = cost;
		this.coordinates = coordinates;
		this.timer = timer;
		this.franchise = franchise;

		this.InitializeRegion(climate);
	}

	notify(event: string, data?: any) {
		if (event === "tick") {
			this.tick();
		}
		if (event === "day") {
			this.ResetImportExport();
		}
		if (event === "week") {

		}
	}

	tick() {

	}

	InitializeRegion(climate: ClimateType) {
		switch (climate) {
			case ClimateType.Arid:
				this.environmentalFactors["soilRichness"] = 0.5 + Math.random() * 0.1;
				this.environmentalFactors["waterAvailability"] = 0.4 + Math.random() * 0.1;
				break;
			case ClimateType.Temperate:
				this.environmentalFactors["soilRichness"] = 1 + Math.random() * 0.2;
				this.environmentalFactors["waterAvailability"] = 1 + Math.random() * 0.2;
				break;
			case ClimateType.Tropical:
				this.environmentalFactors["soilRichness"] = 1.3 + Math.random() * 0.3;
				this.environmentalFactors["waterAvailability"] = 1.5 + Math.random() * 0.3;
				break;
			case ClimateType.Wintry:
				this.environmentalFactors["soilRichness"] = 0.5 + Math.random() * 0.1;
				this.environmentalFactors["waterAvailability"] = 0.4 + Math.random() * 0.1;
				break;
			default:
				break;
		}
	}

	ResetImportExport(){
		this.dailyExport = this.exportCapacity;
		this.dailyImport = this.importCapacity;
	}

	ImportBeans(importAmount: number, fromRegion: Region): number{
		const maxImportable = Math.min(importAmount, this.dailyImport, fromRegion.dailyExport, fromRegion.beans);
		
		this.beans += maxImportable;
		fromRegion.beans -= maxImportable;

		this.dailyImport -= maxImportable;
		this.dailyExport -= maxImportable;

		return maxImportable;
	}

	BuyDevelopment(developmentType: DevelopmentType) {
		let newDev: DevelopmentBase;
	
		if (developmentType === DevelopmentType.Residential) {
			newDev = new Residential(this.timer, this, 10, 1000, this.franchise);
		} else if (developmentType === DevelopmentType.Farm) {
			newDev = new Farm(this.timer, this, 10, 1000, this.franchise);
		} else if (developmentType === DevelopmentType.Logistic) {
			newDev = new LogisticCenter(this.timer, this, 10, 1000, this.franchise);
		} else {
			throw new Error("Unknown development type");
		}
		const numDev = Object.keys(this.developmentList).filter(key => this.developmentList[key].developmentType === developmentType).length;

		this.developmentList[`${DevelopmentType[developmentType]} ${numDev + 1}`] = newDev;
	}

	SellDevelopment(key: string){

	}

	increaseDevelopmentArea(development: string, areaSize: number = 1) {
		if (this.unusedLand >= areaSize) {
			if (this.developmentList[development] === undefined) {
				throw new Error(`Development type ${development} does not exist in this region.`);
			}
			this.developmentList[development].developmentArea += areaSize;
			this.unusedLand -= areaSize;
		}
	}

	decreaseDevelopmentArea(development: string, areaSize: number = 1) {
		if (this.unusedLand >= areaSize) {
			if (this.developmentList[development] === undefined) {
				throw new Error(`Development type ${development} does not exist in this region.`);
			}
			this.developmentList[development].developmentArea -= areaSize;
			this.unusedLand += areaSize;
		}
	}
}