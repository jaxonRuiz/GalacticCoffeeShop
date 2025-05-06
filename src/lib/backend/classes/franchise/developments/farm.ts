import { get, type Writable, writable } from "svelte/store";
import { DevelopmentBase, DevelopmentType } from "./developmentbase";
import type { Publisher } from "$lib/backend/systems/observer";
import type { Region } from "../region";
import type { Franchise } from "../franchise";

export class Farm extends DevelopmentBase {
	get developmentType(): DevelopmentType {
		return DevelopmentType.Farm;
	}

	constructor(timer: Publisher, region: Region, areaSize: number, franchise: Franchise) {
		super(timer, region, areaSize, franchise);
		this.initializeDevelopment();
	}

	get bpt (){
		return Math.floor(this.parent.beansPerHour/16);
	}
	get wpt (){
		return Math.floor(this.parent.waterPerHour/16);
	}

	tick(){
		this.parent.water += this.wpt;
		this.parent.beans += this.bpt;
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
		if (building.type == "farmBuilding"){
			this.parent.beansPerHour += building.num;
		}
		if (building.type == "waterBuilding"){
			this.parent.waterPerHour += building.num;
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
		if (building.type == "farmBuilding"){
			this.parent.beansPerHour -= building.num;
		}
		if (building.type == "waterBuilding"){
			this.parent.waterPerHour -= building.num;
		}
	}

	initializeDevelopment(): void {
		//put all the city specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
		const self = this;
		if (this.franchise.firstFarm){
			this.buyBuilding(this.MakeBuilding("farmBuilding", "small"));
			this.buyBuilding(this.MakeBuilding("waterBuilding", "small"));
			this.franchise.firstFarm = false;
		}
		
		this.updateAvailableBuildings(3); //these should be displayed on the frontend
	}

	updateAvailableBuildings(buildingCount: number): void {
		const self = this;
		this.availableBuildings = [];

		let possibleBuildings = [];
		possibleBuildings.push(this.MakeBuilding("farmBuilding", "small"));
		possibleBuildings.push(this.MakeBuilding("farmBuilding", "small"));
		possibleBuildings.push(this.MakeBuilding("waterBuilding", "small"));
		possibleBuildings.push(this.MakeBuilding("waterBuilding", "small"));

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

