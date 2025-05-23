import { Publisher } from "../../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import type { Region } from "../region";
import { Franchise } from "../franchise";
import { cleanupAudioManagers, AudioManager } from "../../../systems/audioManager";
import { aud } from "../../../../assets/aud";

export enum DevelopmentType{
	Residential = "Residential",
	Farm = "Farm",
	Logistic = "Logistic"
}

export class DevelopmentBase implements IDevelopment{
	// statistics
	w_developmentArea: Writable<number> = writable(10);
	w_developmentType: Writable<DevelopmentType> = writable();

	get developmentArea() {
		return get(this.w_developmentArea);
	}
	set developmentArea(value) {
		this.w_developmentArea.set(value);
	}
	get developmentType() {
		return get(this.w_developmentType);
	}
	set developmentType(value) {
		this.w_developmentType.set(value);
	}

	// buildings
	w_boughtBuildings: Writable<IBuilding[]> = writable([]);
	w_availableBuildings: Writable<IBuilding[]> = writable([]);

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

	parent: Region;
	franchise: Franchise;
	audioManager: AudioManager;
	
	constructor(region: Region, areaSize: number, franchise: Franchise) {
		this.parent = region;
		this.developmentArea = areaSize;
		this.franchise = franchise;
		this.parent.usableLand -= areaSize;

		//audio
		this.audioManager = franchise.audioManager;
	}

	tick(){

	}

	hour(){

	}

	day(){
		
	}

	week(){

	}

	initializeDevelopment(){

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
	}

	sellBuilding(building: IBuilding){
		this.franchise.money += building.sellCost;
		this.developmentArea += building.areaSize;
		const index = this.boughtBuildings.indexOf(building);
		if (index !== -1) {
			this.boughtBuildings.splice(index, 1); // remove from your bought buildings
			this.boughtBuildings = [...this.boughtBuildings]; // update for svelte
		}
	}

	payRent(){
		this.boughtBuildings.forEach(element => {
			this.franchise.money -= element.rent;
		});
	}

	updateAvailableBuildings(buildingCount: number){

	}

	readBuilding(building: IBuilding){
		switch (building.type) {
			case "coffeeBuilding":
				return `Sells up to ${building.num} coffees/hour`;
			case "housingBuilding":
				return `Increase population by ${building.num}`;
			case "importBuilding":
				return `Increase import capacity by ${building.num}`;
			case "exportBuilding":
				return `Increase export capacity by ${building.num}`;
			case "deliveryBuilding":
				return `Increase deliveries by ${building.num}/hour`;
			case "waterBuilding":
				return `Produces ${building.num} gallons of water/hour`;
			case "farmBuilding":
				return `Produces up to ${building.num} beans/hour`;
			case "researchBuilding":
				return `Increase researcher population by ${building.num}`;
			default:
				break;
		}
	}

	buildingClickable(building: IBuilding): boolean{
		switch (building.type) {
			case "coffeeBuilding":
				return true;
			case "housingBuilding":
				return false;
			case "importBuilding":
				return false;
			case "exportBuilding":
				return false;
			case "deliveryBuilding":
				return false;
			case "waterBuilding":
				return true;
			case "farmBuilding":
				return true;
			case "researchBuilding":
				return false;
			default:
				return false;
		}
	}

	clickText(building: IBuilding){
		switch (building.type) {
			case "coffeeBuilding":
				return `Click to sell ${Math.floor(building.num/10)} coffees`;
			case "waterBuilding":
				return `Click to pump ${Math.floor(building.num/10)} gallons`;
			case "farmBuilding":
				return `Click to farm ${Math.floor(building.num/10)} beans`;
			default:
				return;
		}
	}

	clickBuilding(building: IBuilding) {
		
	}

	increaseDevelopmentArea(areaSize: number = 1) {
		if (this.parent.usableLand >= areaSize) {
			this.developmentArea += areaSize;
			this.parent.usableLand -= areaSize;
		}
	}

	decreaseDevelopmentArea(areaSize: number = 1) {
		if (this.developmentArea - areaSize >= 0) {
			this.developmentArea -= areaSize;
			this.parent.usableLand += areaSize;
		}
	}

	MakeBuilding(buildingType: BuildingType, buildingSize: BuildingSize) {
		var data = this.BuildingList[buildingType][buildingSize];
		var randomName = data.names[Math.floor(Math.random() * data.names.length)];
		var multiplier = 1;
		if (buildingType == 'coffeeBuilding') multiplier = this.franchise.maxCoffeeMultiplier;
		else if (buildingType == 'farmBuilding') multiplier = this.franchise.coffeeMultiplier;
		else if (buildingType == 'waterBuilding') multiplier = this.franchise.waterMultiplier;
		else if (buildingType == 'housingBuilding') multiplier = this.franchise.populationMultiplier;
		else if (buildingType == 'researchBuilding') multiplier = this.franchise.researcherMultiplier;
		
		return {
			name: randomName,
			type: buildingType,
			areaSize: data.areaSize,
			buyCost: data.cost * (1 + Math.floor(Math.random() * 10) / 20) * Math.pow(1.5, this.parent.populationPurchasingPower),
			sellCost: data.cost * (1 - Math.floor(Math.random() * 10) / 20) * Math.pow(1.5, this.parent.populationPurchasingPower),
			rent: data.rent * Math.pow(1.5, this.parent.populationPurchasingPower),
			num: Math.floor(data.num * (1 + Math.random() * 0.5) * multiplier)
		};
	}

	BuildingList: Record<BuildingType, Record<BuildingSize, BuildingData>> = {
		coffeeBuilding: {
			small: { names: ["The Bean Bros", "Mocha Mart"], cost: 2000, num: 20, areaSize: 1, rent: 50 },
			medium: { names: ["Big Bean Bar", "Cocoa Company"], cost: 4000, num: 40, areaSize: 2, rent: 100 },
			large: { names: ["The Bean.", "The Coffee Cacophony"], cost: 7000, num: 80, areaSize: 4, rent: 200 }
		},
		housingBuilding: {
			small: { names: ["Da Motel", "Cozy Cabins"], cost: 2000, num: 1000, areaSize: 1, rent: 50 },
			medium: { names: ["Suburbia", "Town Villa"], cost: 4000, num: 2000, areaSize: 2, rent: 100 },
			large: { names: ["100 Story Skyscraper", "Rich People Houses"], cost: 7000, num: 5000, areaSize: 4, rent: 200 }
		},
		importBuilding: {
			small: { names: ["Mini Dock", "Petite Port"], cost: 2000, num: 1000, areaSize: 2, rent: 50 },
			medium: { names: ["City Import Hub", "Regional Docks"], cost: 4000, num: 2000, areaSize: 3, rent: 100 },
			large: { names: ["International Port", "Global Exchange"], cost: 7000, num: 4000, areaSize: 5, rent: 200 }
		},
		exportBuilding: {
			small: { names: ["Small Shipping Co.", "Local Exporters"], cost: 2000, num: 1000, areaSize: 2, rent: 50 },
			medium: { names: ["Export Hub", "Regional Traders"], cost: 4000, num: 2000, areaSize: 3, rent: 100 },
			large: { names: ["Worldwide Export HQ", "Global Freight Center"], cost: 7000, num: 4000, areaSize: 5, rent: 200 }
		},
		deliveryBuilding: {
			small: { names: ["Courier Station", "Tiny Depot"], cost: 2000, num: 100, areaSize: 1, rent: 50 },
			medium: { names: ["Regional Logistics", "Citywide Express"], cost: 4000, num: 200, areaSize: 2, rent: 100 },
			large: { names: ["National Dispatch Center", "Continental Couriers"], cost: 7000, num: 400, areaSize: 4, rent: 200 }
		},
		waterBuilding: {
			small: { names: ["Small Water Plant", "Tiny Aqueduct"], cost: 2000, num: 50, areaSize: 1, rent: 50 },
			medium: { names: ["City Waterworks", "Municipal Reservoir"], cost: 4000, num: 100, areaSize: 2, rent: 100 },
			large: { names: ["Mega Water Facility", "Continental Hydration"], cost: 7000, num: 200, areaSize: 4, rent: 200 }
		},
		farmBuilding: {
			small: { names: ["Family Farm", "Urban Garden"], cost: 2000, num: 30, areaSize: 2, rent: 50 },
			medium: { names: ["Regional Farm", "Commercial Orchard"], cost: 4000, num: 60, areaSize: 3, rent: 100 },
			large: { names: ["Industrial Farm Complex", "Agro-Enterprise Zone"], cost: 7000, num: 120, areaSize: 5, rent: 200 }
		},
		researchBuilding: {
			small: { names: ["R&Deez Beans", "Lil Lab"], cost: 2000, num: 50, areaSize: 1, rent: 50 },
			medium: { names: ["The Idea Generator", "The Research Gallery"], cost: 4000, num: 100, areaSize: 2, rent: 100 },
			large: { names: ["The Big Think", "Super Mega Lab"], cost: 7000, num: 200, areaSize: 4, rent: 200 }
		}
	};
}


