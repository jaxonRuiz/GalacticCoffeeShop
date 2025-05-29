import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import type { Country } from "./country";
//import { dev } from "$app/environment";
import { Franchise } from "./franchise";
import { dictProxy } from "$lib/backend/proxies";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";
import type Building from "$lib/components/franchise/Building.svelte";
import { addCoffee, addMoney } from "$lib/backend/analytics";

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
	w_environmentalFactors: Writable<{ [key: string]: number }> = writable({
		soilRichness: 1,
		waterAvailability: 1,
		averageTemp: 1,
	});
	w_accessibilityLevel: Writable<number> = writable(10);
	w_importCapacity: Writable<number> = writable(100);
	w_exportCapacity: Writable<number> = writable(100);
	w_beans: Writable<number> = writable(0);
	w_unlocked: Writable<boolean> = writable(false);
	w_population: Writable<number> = writable(500);
	w_voteInProgress: Writable<boolean> = writable(false);
	w_expectedCustomersPerHour: Writable<number> = writable();

	// building stuff
	w_boughtBuildings: Writable<IBuilding[]> = writable([]);
	w_availableBuildings: Writable<IBuilding[]> = writable([]);

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
		this.w_maxCoffeePerHour.set(value);
	}
	get populationPurchasingPower() {
		return get(this.w_populationPurchasingPower);
	}
	set populationPurchasingPower(value) {
		const old = this.populationPurchasingPower ?? 1;
		this.w_populationPurchasingPower.set(value);
		this.boughtBuildings.forEach(element => {
			element.buyCost *= value/old;
			element.sellCost *= value/old;
			element.rent *= value/old;
		});
		this.availableBuildings.forEach(element => {
			element.buyCost *= value/old;
			element.sellCost *= value/old;
			element.rent *= value/old;
		});
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
	get boughtBuildings() {
		return get(this.w_boughtBuildings);
	}
	set boughtBuildings(value: IBuilding[]) {
		this.w_boughtBuildings.set(value);
	}
	get availableBuildings() {
		return get(this.w_availableBuildings);
	}
	set availableBuildings(value: IBuilding[]) {
		this.w_availableBuildings.set(value);
	}

	//internal variables
	dailyImport: number = this.importCapacity;
	dailyExport: number = this.exportCapacity;
	unlockCost: number;
	coordinates: [number, number];
	climate: ClimateType;

	parentCountry: Country;
	franchise: Franchise;
	audioManager: AudioManager;

	constructor(
		country: Country,
		franchise: Franchise,
		areaSize: number,
		climate: ClimateType,
		coordinates: [number, number],
		unlocked: boolean,
		purchasingPower: number,
		isFirst: boolean
	) {
		this.populationPurchasingPower = purchasingPower;
		this.parentCountry = country;
		this.totalArea = areaSize;
		this.unusableLand = Math.floor(this.totalArea/3); //probably change
		this.usableLand = this.totalArea - this.unusableLand;
		this.boughtUnusable = 0;
		this.unlockCost = (200 + Math.floor(Math.random() * 100));
		this.coordinates = coordinates;
		this.franchise = franchise;
		this.population = 1000;
		this.coffeesSoldLastHour = 0;
		this.unlocked = unlocked;
		this.expectedCustomersPerHour = this.population/franchise.populationDivisor;
		this.climate = climate;

		this.initializeRegion(climate, isFirst);

		//audio
		this.audioManager = this.franchise.audioManager;
	}

	tick(){
		this.tickCoffee();
		this.tickBeans();
	}

	hour() {
		this.coffeesSoldLastHour = this.coffeeSoldThisHour;
		this.coffeeSoldThisHour = 0;
	}

	day() {
		this.updateAvailableBuildings(4);
	}

	initializeRegion(climate: ClimateType, firstRegion: boolean) {
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
		this.population *= 10 * Math.random();
		if (firstRegion) this.population = 5000;
		this.population = Math.floor(this.population);
		this.updateAvailableBuildings(4);
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

	//BUILDING STUFF

	buyBuilding(building: IBuilding){
		if (building.areaSize > this.usableLand || building.buyCost > this.franchise.money) {return;}

		this.franchise.money -= building.buyCost; //pay your dues
		this.usableLand -= building.areaSize;
		this.boughtBuildings = [...this.boughtBuildings, building]; //add to bought buildings
		const index = this.availableBuildings.indexOf(building);
		if (index !== -1) {
			this.availableBuildings.splice(index, 1); // remove from available buildings
			this.availableBuildings = [...this.availableBuildings]; // update for svelte
		}
		if (building.type == "farmBuilding"){
			this.beansPerHour += building.num;
		}
		if (building.type == "coffeeBuilding"){
			this.maxCoffeePerHour += building.num;
		}
	}

	sellBuilding(building: IBuilding){
		this.franchise.money += building.sellCost;
		this.usableLand += building.areaSize;
		const index = this.boughtBuildings.indexOf(building);
		if (index !== -1) {
			this.boughtBuildings.splice(index, 1); // remove from your bought buildings
			this.boughtBuildings = [...this.boughtBuildings]; // update for svelte
		}
		if (building.type == "farmBuilding"){
			this.beansPerHour -= building.num;
		}
		if (building.type == "coffeeBuilding"){
			this.maxCoffeePerHour -= building.num;
		}
	}

	readBuilding(building: IBuilding){
		switch (building.type) {
			case "coffeeBuilding":
				return `Sells up to ${building.num} coffees/hour`;
			case "farmBuilding":
				return `Produces up to ${building.num} beans/hour`;
			default:
				break;
		}
	}

	MakeBuilding(buildingType: BuildingType, buildingSize: BuildingSize) {
		var data = this.BuildingList[buildingType][buildingSize];
		var randomName = data.names[Math.floor(Math.random() * data.names.length)];
		var multiplier = 1;
		if (buildingType == 'coffeeBuilding') multiplier = this.franchise.maxCoffeeMultiplier;
		else if (buildingType == 'farmBuilding') multiplier = this.franchise.coffeeMultiplier;
		
		return {
			name: randomName,
			type: buildingType,
			areaSize: data.areaSize,
			buyCost: data.cost * (1 + Math.floor(Math.random() * 10) / 20) * Math.pow(1.5, this.populationPurchasingPower),
			sellCost: data.cost * (1 - Math.floor(Math.random() * 10) / 20) * Math.pow(1.5, this.populationPurchasingPower),
			rent: data.rent * Math.pow(1.5, this.populationPurchasingPower),
			num: Math.floor(data.num * (1 + Math.random() * 0.5) * multiplier)
		};
	}

	updateAvailableBuildings(buildingCount: number): void {
		const self = this;
		this.availableBuildings = [];

		let possibleBuildings = [];
		if (this.franchise.moneyPerHour < (150 * this.populationPurchasingPower))	{
			possibleBuildings.push(this.MakeBuilding("farmBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("farmBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("coffeeBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("coffeeBuilding", "small"));
		}
		if (this.franchise.moneyPerHour >= (150 * this.populationPurchasingPower)){
			possibleBuildings.push(this.MakeBuilding("farmBuilding", "medium"));
			possibleBuildings.push(this.MakeBuilding("coffeeBuilding", "medium"));
		}
		if (this.franchise.moneyPerHour >= (200 * this.populationPurchasingPower)){
			possibleBuildings.push(this.MakeBuilding("farmBuilding", "large"));
			possibleBuildings.push(this.MakeBuilding("coffeeBuilding", "large"));
			possibleBuildings.push(this.MakeBuilding("farmBuilding", "medium"));
			possibleBuildings.push(this.MakeBuilding("coffeeBuilding", "medium"));
		}

		this.availableBuildings = this.getRandomSubset(possibleBuildings, buildingCount);
	}

	getRandomSubset<T>(array: T[], count: number): T[] {
		const copy = [...array];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy.slice(0, count);
	}

	BuildingList: Record<BuildingType, Record<BuildingSize, BuildingData>> = {
		coffeeBuilding: {
			small: { names: ["The Bean Bros", "Mocha Mart"], cost: 2000, num: 20, areaSize: 4, rent: 50 },
			medium: { names: ["Big Bean Bar", "Cocoa Company"], cost: 4000, num: 40, areaSize: 5, rent: 100 },
			large: { names: ["The Bean.", "The Coffee Cacophony"], cost: 7000, num: 80, areaSize: 6, rent: 200 }
		},
		farmBuilding: {
			small: { names: ["Family Farm", "Urban Garden"], cost: 2000, num: 30, areaSize: 4, rent: 50 },
			medium: { names: ["Regional Farm", "Commercial Orchard"], cost: 4000, num: 60, areaSize: 5, rent: 100 },
			large: { names: ["Industrial Farm Complex", "Agro-Enterprise Zone"], cost: 7000, num: 120, areaSize: 6, rent: 200 }
		},
	};

	coffeeAccumulator: number = 0;
	coffeeSoldThisHour: number = 0;
	get coffeePrice(): number{
	  return 5 * this.populationPurchasingPower;
	}
	
	sellCoffee(coffeeAmount: number){
		if (coffeeAmount > this.beans){
		this.parentCountry.importBeansTo(coffeeAmount - this.beans, this); //try to import as much as possible
		}
		var coffeeSold = Math.max(Math.min(coffeeAmount, this.beans, Math.floor(this.expectedCustomersPerHour) - this.coffeeSoldThisHour), 0);

		this.beans -= coffeeSold;
		this.coffeeSoldThisHour += coffeeSold;
		this.franchise.money += coffeeSold * this.coffeePrice * (1 - this.parentCountry.taxRate);
		this.franchise.taxedMoney += coffeeSold * this.coffeePrice * (this.parentCountry.taxRate);
		//ANALYTICS
		addCoffee(coffeeSold);
		addMoney(coffeeSold * this.coffeePrice * (1 - this.parentCountry.taxRate));
	}

	tickCoffee() {
		const coffeePerTick = Math.min(this.maxCoffeePerHour, this.expectedCustomersPerHour) / 16;
		this.coffeeAccumulator += coffeePerTick;

		if (this.coffeeAccumulator >= 1){
			const wholeCoffees = Math.floor(this.coffeeAccumulator);
			this.sellCoffee(wholeCoffees);
			this.coffeeAccumulator -= wholeCoffees;
		}
	}

	get bpt (){
		return this.beansPerHour/16; //16 ticks per hour
	}

	beanAccumulator: number = 0;

	tickBeans() {
		this.beanAccumulator += this.bpt;

		if (this.beanAccumulator >= 1) {
			const wholeBeans = Math.floor(this.beanAccumulator);
			this.beans += wholeBeans;
			this.beanAccumulator -= wholeBeans;
		}
	}

	increaseImport(amount: number) {
		const cost = 10;
		if (amount * cost > this.franchise.money) return;
		this.franchise.money -= amount * cost;
		this.importCapacity += amount;
	}

	increaseExport(amount: number) {
		const cost = 10;
		if (amount * cost > this.franchise.money) return;
		this.franchise.money -= amount * cost;
		this.exportCapacity += amount;
	}

	readClimate(climate: ClimateType): string{
		switch (climate) {
			case ClimateType.Arid:
				return "Arid";
			case ClimateType.Temperate:
				return "Temperate";
			case ClimateType.Tropical:
				return "Tropical";
			case ClimateType.Wintry:
				return "Wintry";
			default:
				return "";
		}
	}
}
