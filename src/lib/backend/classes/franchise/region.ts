import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import {
	DevelopmentBase,
} from "./developments/developmentbase";
import type { Country } from "./country";
//import { dev } from "$app/environment";
import { Residential } from "./developments/residential";
import { Franchise } from "./franchise";
import { Farm } from "./developments/farm";
import { LogisticCenter } from "./developments/logisticCenter";
import { dictProxy } from "$lib/backend/proxies";

export enum ClimateType {
	Arid = 0,
	Wintry = 1,
	Temperate = 2,
	Tropical = 3,
}

export class Region implements IRegion {
	//writables
	w_totalArea: Writable<number> = writable(0);
	w_usableLand: Writable<number> = writable(0);
	w_unusableLand: Writable<number> = writable(0);
	w_boughtUnusable: Writable<number> = writable(0);
	w_unusableBuyCost: Writable<number> = writable(0);
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
	w_deliveriesPerHour: Writable<number> = writable(100);
	w_deliveriesThisHour: Writable<number> = writable(0);
	w_beans: Writable<number> = writable(0);
	w_unlocked: Writable<boolean> = writable(false);
	w_population: Writable<number> = writable(500);
	w_voteInProgress: Writable<boolean> = writable(false);
	w_expectedCustomersPerHour: Writable<number> = writable();

	get voteInProgress() {
		return get(this.w_voteInProgress);
	}
	set voteInProgress(value) {
		this.w_voteInProgress.set(value);
	} 

	//farm
	w_water: Writable<number> = writable(0);
	w_beansPerHour: Writable<number> = writable(0);
	w_waterPerHour: Writable<number> = writable(0);

	get water() {
		return get(this.w_water);
	}
	set water(value) {
		this.w_water.set(value);
	}
	get beansPerHour() {
		return get(this.w_beansPerHour);
	}
	set beansPerHour(value) {
		this.w_beansPerHour.set(value);
	}
	get waterPerHour() {
		return get(this.w_waterPerHour);
	}
	set waterPerHour(value) {
		this.w_waterPerHour.set(value);
	}

	//city
	w_maxCoffeePerHour: Writable<number> = writable(0);
	w_populationPurchasingPower: Writable<number> = writable(1);
	w_coffeesSoldLastHour: Writable<number> = writable(0);

	get maxCoffeePerHour() {
		return get(this.w_maxCoffeePerHour);
	}
	set maxCoffeePerHour(value) {
		const old = this.maxCoffeePerHour;
		this.w_maxCoffeePerHour.set(value);
		for (let key in this.developmentList){
			this.developmentList[key].boughtBuildings.forEach(building => {
				if (building.type == 'coffeeBuilding'){
					building.num *= value/old;
				}
			});
			this.developmentList[key].availableBuildings.forEach(building => {
				if (building.type == 'coffeeBuilding'){
					building.num *= value/old;
				}
			});
		}
	}
	get populationPurchasingPower() {
		return get(this.w_populationPurchasingPower);
	}
	set populationPurchasingPower(value) {
		const old = this.populationPurchasingPower ?? 1;
		this.w_populationPurchasingPower.set(value);
		for (let key in this.developmentList){
			this.developmentList[key].boughtBuildings.forEach(element => {
				element.buyCost *= value/old;
				element.sellCost *= value/old;
				element.rent *= value/old;
			});
			this.developmentList[key].availableBuildings.forEach(element => {
				element.buyCost *= value/old;
				element.sellCost *= value/old;
				element.rent *= value/old;
			});
		}
	}
	get coffeesSoldLastHour() {
		return get(this.w_coffeesSoldLastHour);
	}
	set coffeesSoldLastHour(value) {
		this.w_coffeesSoldLastHour.set(value);
	}

	//getters and setters
	get totalArea() {
		return get(this.w_totalArea);
	}
	set totalArea(value) {
		this.w_totalArea.set(value);
	}
	get developmentList() {
		return dictProxy(this.w_developmentList);
	}
	set developmentList(value: { [key: string]: DevelopmentBase }) {
		this.w_developmentList.set(value);
	}
	get environmentalFactors() {
		return dictProxy(this.w_environmentalFactors);
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
	get deliveriesPerHour() {
		return get(this.w_deliveriesPerHour);
	}
	set deliveriesPerHour(value) {
		this.w_deliveriesPerHour.set(value);
	}
	get deliveriesThisHour() {
		return get(this.w_deliveriesThisHour);
	}
	set deliveriesThisHour(value) {
		this.w_deliveriesThisHour.set(value);
	}
	get usableLand() {
		return get(this.w_usableLand);
	}
	set usableLand(value) {
		this.w_usableLand.set(value);
	}
	get unusableLand() {
		return get(this.w_unusableLand);
	}
	set unusableLand(value) {
		this.w_unusableLand.set(value);
	}
	get boughtUnusable() {
		return get(this.w_boughtUnusable);
	}
	set boughtUnusable(value) {
		this.w_boughtUnusable.set(value);
		this.w_unusableBuyCost.set(Math.floor(1000 * Math.pow(1.3, value)));
	}
	get beans() {
		return get(this.w_beans);
	}
	set beans(value) {
		this.w_beans.set(value);
	}
	get unlocked(){
		return get(this.w_unlocked);
	}
	set unlocked(value){
		this.w_unlocked.set(value);
	}
	get population(){
		return get(this.w_population);
	}
	set population(value){
		const old = this.population;
		this.w_population.set(value);
		this.expectedCustomersPerHour *= value/old;
	}
	get expectedCustomersPerHour() {
		return get(this.w_expectedCustomersPerHour)
	}
	set expectedCustomersPerHour(value) {
		this.w_expectedCustomersPerHour.set(value);
	}

	//internal variables
	dailyImport: number = this.importCapacity;
	dailyExport: number = this.exportCapacity;
	unlockCost: number;
	coordinates: [number, number];

	parentCountry: Country;
	franchise: Franchise;

	constructor(
		country: Country,
		franchise: Franchise,
		areaSize: number,
		climate: ClimateType,
		coordinates: [number, number],
		unlocked: boolean,
		purchasingPower: number
	) {
		this.populationPurchasingPower = purchasingPower;
		this.parentCountry = country;
		this.totalArea = areaSize;
		this.unusableLand = Math.floor(this.totalArea/3); //probably change
		this.usableLand = this.totalArea - this.unusableLand;
		this.boughtUnusable = 0;
		this.unlockCost = (2000 + Math.floor(Math.random() * 1000)) * purchasingPower;
		this.coordinates = coordinates;
		this.franchise = franchise;
		this.population = 1000;
		this.coffeesSoldLastHour = 0;
		this.unlocked = unlocked;
		this.expectedCustomersPerHour = this.population/franchise.populationDivisor;

		this.initializeRegion(climate);
	}

	tick(){
		for (let devkey in this.developmentList) {
			this.developmentList[devkey].tick();
		}
	}

	hour() {
		this.deliveriesThisHour = 0;
		for (let devkey in this.developmentList) {
			this.developmentList[devkey].hour();
		}
	}

	day() {
		for (let devkey in this.developmentList) {
			this.developmentList[devkey].day();
		}
	}

	initializeRegion(climate: ClimateType) {
		switch (climate) {
			case ClimateType.Arid:
				this.environmentalFactors["soilRichness"] = 0.5 + Math.random() * 0.1;
				this.environmentalFactors["waterAvailability"] = 0.4 +
					Math.random() * 0.1;
				break;
			case ClimateType.Temperate:
				this.environmentalFactors["soilRichness"] = 1 + Math.random() * 0.2;
				this.environmentalFactors["waterAvailability"] = 1 +
					Math.random() * 0.2;
				break;
			case ClimateType.Tropical:
				this.environmentalFactors["soilRichness"] = 1.3 + Math.random() * 0.3;
				this.environmentalFactors["waterAvailability"] = 1.5 +
					Math.random() * 0.3;
				break;
			case ClimateType.Wintry:
				this.environmentalFactors["soilRichness"] = 0.5 + Math.random() * 0.1;
				this.environmentalFactors["waterAvailability"] = 0.4 +
					Math.random() * 0.1;
				break;
			default:
				break;
		}
		this.initializeDevelopments();
	}

	resetImportExport() {
		this.dailyExport = this.exportCapacity;
		this.dailyImport = this.importCapacity;
	}

	importBeans(importAmount: number, fromRegion: Region): number {
		const maxImportable = Math.min(
			importAmount,
			this.dailyImport,
			fromRegion.dailyExport,
			fromRegion.beans,
		);

		this.beans += maxImportable;
		fromRegion.beans -= maxImportable;

		this.dailyImport -= maxImportable;
		this.dailyExport -= maxImportable;

		return maxImportable;
	}

	initializeDevelopments() {
		this.developmentList["farm"] = new Farm(this, 7, this.franchise);
		this.developmentList["residential"] = new Residential(this, 5, this.franchise);
		this.developmentList["logistic"] = new LogisticCenter(this, 4, this.franchise);
	}

	unlockRegion() {
		this.unlocked = true;
	}

	buyUnusable(){
		if (this.franchise.money >= get(this.w_unusableBuyCost) && this.unusableLand > 0){
			this.franchise.money -= get(this.w_unusableBuyCost);
			this.boughtUnusable++;
			this.unusableLand--;
			this.usableLand++;
		}
	}
}
