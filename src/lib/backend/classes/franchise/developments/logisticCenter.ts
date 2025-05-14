import type { Publisher } from "$lib/backend/systems/observer";
import type { Franchise } from "../franchise";
import type { Region } from "../region";
import { DevelopmentBase, DevelopmentType } from "./developmentbase";

export class LogisticCenter extends DevelopmentBase{
	get developmentType(): DevelopmentType {
		return DevelopmentType.Logistic;
	  }

	constructor(region: Region, areaSize: number, franchise: Franchise) {
		super(region, areaSize, franchise);
		this.initializeDevelopment();
	}

	day() {
		this.updateAvailableBuildings(5);
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
		if (building.type == "importBuilding"){
			this.parent.importCapacity += building.num;
		}
		if (building.type == "exportBuilding"){
			this.parent.exportCapacity += building.num;
		}
		if (building.type == "deliveryBuilding"){
			this.parent.deliveriesPerHour += building.num;
		}
		if (building.type == "researchBuilding"){
			this.franchise.researchers += building.num;
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
		if (building.type == "importBuilding"){
			this.parent.importCapacity -= building.num;
		}
		if (building.type == "exportBuilding"){
			this.parent.exportCapacity -= building.num;
		}
		if (building.type == "deliveryBuilding"){
			this.parent.deliveriesPerHour -= building.num;
		}
		if (building.type == "researchBuilding"){
			this.franchise.researchers -= building.num;
		}
	}

	initializeDevelopment(): void {
		//put all the city specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
		this.updateAvailableBuildings(5); //these should be displayed on the frontend
	}

	updateAvailableBuildings(buildingCount: number): void {
		const self = this;
		this.availableBuildings = [];

		let possibleBuildings = [];
		if (this.franchise.moneyPerHour < (150 * this.parent.populationPurchasingPower))	{
			possibleBuildings.push(this.MakeBuilding("deliveryBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("importBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("exportBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("deliveryBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("researchBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("researchBuilding", "small"));
		}
		else if (this.franchise.moneyPerHour >= (150 * this.parent.populationPurchasingPower)){
			possibleBuildings.push(this.MakeBuilding("deliveryBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("importBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("exportBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("deliveryBuilding", "medium"));
			possibleBuildings.push(this.MakeBuilding("researchBuilding", "small"));
			possibleBuildings.push(this.MakeBuilding("researchBuilding", "medium"));
		}
		else if (this.franchise.moneyPerHour >= (200 * this.parent.populationPurchasingPower)){
			possibleBuildings.push(this.MakeBuilding("deliveryBuilding", "large"));
			possibleBuildings.push(this.MakeBuilding("importBuilding", "medium"));
			possibleBuildings.push(this.MakeBuilding("exportBuilding", "medium"));
			possibleBuildings.push(this.MakeBuilding("deliveryBuilding", "medium"));
			possibleBuildings.push(this.MakeBuilding("researchBuilding", "large"));
			possibleBuildings.push(this.MakeBuilding("researchBuilding", "medium"));
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
}

