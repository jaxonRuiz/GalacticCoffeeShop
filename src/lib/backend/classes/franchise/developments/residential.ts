import { get, type Writable, writable } from "svelte/store";
import { DevelopmentBase, DevelopmentType } from "./developmentbase";
import type { Publisher } from "$lib/backend/systems/observer";
import type { Region } from "../region";
import type { Franchise } from "../franchise";

export class Residential extends DevelopmentBase implements IResidential{
	get developmentType(): DevelopmentType {
		return DevelopmentType.Residential;
	}

	coffeeSoldThisHour: number = 0;

	//helpers
	get coffeePrice(): number{
	  return 5 * this.parent.populationPurchasingPower;
	}
	get hourlyCustomerEstimate(): number{
	  return this.parent.population/this.franchise.populationDivisor;
	}

	constructor(timer: Publisher, region: Region, areaSize: number, franchise: Franchise) {
			super(timer, region, areaSize, franchise);
			this.initializeDevelopment();
		}

	sellCoffee(coffeeAmount: number){
	  if (coffeeAmount > this.parent.beans){
		this.parent.parentCountry.importBeansTo(coffeeAmount - this.parent.beans, this.parent); //try to import as much as possible
	  }
	  var coffeeSold = Math.min(coffeeAmount, this.parent.beans);

	  this.parent.beans -= coffeeSold;
	  this.coffeeSoldThisHour += coffeeSold;
	  this.franchise.money += coffeeSold * this.coffeePrice;
	}

	tick(){
		this.sellCoffee(Math.floor(Math.min(this.parent.maxCoffeePerHour, this.hourlyCustomerEstimate) / 16)); //FIX!! only sells multiples of 16 when youre starting off
	}

	hour(){
		this.parent.coffeesSoldLastHour = this.coffeeSoldThisHour;
		this.coffeeSoldThisHour = 0;
	}

	day() {
	}

	buyBuilding(building: IBuilding){
		if (building.areaSize > this.developmentArea || building.buyCost > this.franchise.money) {return;}

		this.franchise.money -= building.buyCost; //pay your dues
		this.developmentArea -= building.areaSize;
		this.boughtBuildings = [...this.boughtBuildings, building]; //add to bought buildings
		const index = this.availableBuildings.indexOf(building);
		if (index !== -1) {
			this.availableBuildings.splice(index, 1); // remove from available buildings
			this.availableBuildings = [...this.availableBuildings]; // update for svelte
		}
		if (building.type == "coffeeBuilding"){
			this.parent.maxCoffeePerHour += building.num;
		}
		if (building.type == "housingBuilding"){
			this.parent.population += building.num;
		}
	}

	sellBuilding(building: IBuilding){
		this.franchise.money += building.sellCost;
		this.developmentArea += building.areaSize;
		const index = this.boughtBuildings.indexOf(building);
		if (index !== -1) {
			this.boughtBuildings.splice(index, 1); // remove from your bought buildings
			this.boughtBuildings = [...this.boughtBuildings]; // update for svelte
		}
		if (building.type == "coffeeBuilding"){
			this.parent.maxCoffeePerHour -= building.num;
		}
		if (building.type == "housingBuilding"){
			this.parent.population -= building.num;
		}
	}

	initializeDevelopment(): void {
		//put all the city specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
		const self = this;
		if (this.franchise.firstCity){
			this.buyBuilding(this.MakeBuilding("housingBuilding", "small"));
			this.buyBuilding(this.MakeBuilding("coffeeBuilding", "small"));
			this.franchise.firstCity = false;
		}
		
		this.updateAvailableBuildings(3); //these should be displayed on the frontend
	}

	updateAvailableBuildings(buildingCount: number): void {
		const self = this;
		this.availableBuildings = [];

		let possibleBuildings = [];
		possibleBuildings.push(this.MakeBuilding("housingBuilding", "small"));
		possibleBuildings.push(this.MakeBuilding("housingBuilding", "small"));
		possibleBuildings.push(this.MakeBuilding("coffeeBuilding", "small"));
		possibleBuildings.push(this.MakeBuilding("coffeeBuilding", "small"));

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
	
}

