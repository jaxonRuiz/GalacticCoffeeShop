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

export class Region implements ISubscriber, IRegion {
	//writables
	w_totalArea: Writable<number> = writable(30);
	w_unusedLand: Writable<number> = writable(30);
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
	w_deliveriesPerHour: Writable<number> = writable(1000);
	w_beans: Writable<number> = writable(0);
	w_unlocked: Writable<boolean> = writable(false);
	w_population: Writable<number> = writable(1000);

	//farm
	w_water: Writable<number> = writable(0);
	w_beansPerHour: Writable<number> = writable(0);
	w_waterPerHour: Writable<number> = writable(0);
	w_researchersPerDay: Writable<number> = writable(0);

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
	get researchersPerDay() {
		return get(this.w_researchersPerDay);
	}
	set researchersPerDay(value) {
		this.w_researchersPerDay.set(value);
	}

	//city
	w_maxCoffeePerHour: Writable<number> = writable(0);
	w_populationPurchasingPower: Writable<number> = writable(1);
	w_coffeesSoldLastHour: Writable<number> = writable(0);

	get maxCoffeePerHour() {
		return get(this.w_maxCoffeePerHour);
	}
	set maxCoffeePerHour(value) {
		this.w_maxCoffeePerHour.set(value);
	}
	get populationPurchasingPower() {
		return get(this.w_populationPurchasingPower);
	}
	set populationPurchasingPower(value) {
		this.w_populationPurchasingPower.set(value);
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
	get unusedLand() {
		return get(this.w_unusedLand);
	}
	set unusedLand(value) {
		this.w_unusedLand.set(value);
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
		this.w_population.set(value);
	}

	//internal variables
	dailyImport: number = this.importCapacity;
	dailyExport: number = this.exportCapacity;
	unlockCost: number;
	coordinates: [number, number];

	timer: Publisher;
	parentCountry: Country;
	franchise: Franchise;

	constructor(
		timer: Publisher,
		country: Country,
		franchise: Franchise,
		areaSize: number,
		cost: number,
		climate: ClimateType,
		coordinates: [number, number],
		unlocked: boolean
	) {
		console.log("region constructor()");
		timer = franchise.timer;
		timer.subscribe(this, "tick");
		timer.subscribe(this, "hour");
		timer.subscribe(this, "week");
		this.parentCountry = country;
		this.totalArea = areaSize;
		this.unlockCost = cost;
		this.coordinates = coordinates;
		this.timer = timer;
		this.franchise = franchise;
		this.population = 1000;
		this.coffeesSoldLastHour = 0;
		this.unlocked = unlocked;

		this.initializeRegion(climate);
	}

	notify(event: string, data?: any) {
		if (event === "tick") {
			this.tick();
		}
		if (event === "day") {
			this.resetImportExport();
		}
		if (event === "week") {
		}
	}

	tick(){
		
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
		this.developmentList["farm"] = new Farm(this.timer, this, 7, this.franchise);
		this.developmentList["residential"] = new Residential(this.timer, this, 5, this.franchise);
		this.developmentList["logistic"] = new LogisticCenter(this.timer, this, 4, this.franchise);
	}

	unlockRegion(): boolean {
		if (this.unlocked) return false;
		if (this.franchise.money >= this.unlockCost){
			this.unlocked = true;
			this.franchise.money -= this.unlockCost;
			return true;
		}
		else{
			console.log("You are too broke to afford this propery");
			return false;
		}
	}
}
