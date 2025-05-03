import { Publisher } from "../../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import type { Region } from "../region";
import { Franchise } from "../franchise";

export enum DevelopmentType{
	Residential = "Residential",
	Farm = "Farm",
	Logistic = "Logistic"
}

export class DevelopmentBase implements ISubscriber, IDevelopment{
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
	
	constructor(timer: Publisher, region: Region, areaSize: number, franchise: Franchise) {
		timer.subscribe(this, "tick");
		timer.subscribe(this, "hour");
		timer.subscribe(this, "day");
		timer.subscribe(this, "week");
		this.parent = region;
		this.developmentArea = areaSize;
		this.franchise = franchise;
		this.parent.usableLand -= areaSize;
	}

	notify(event: string, data?: any) {
		// maybe optimize better :/ dont need to call every shop every tick
		if (event === "tick") {
			this.tick();
		}
		if (event === "hour"){
			this.hour();
		}
		if (event === "day") {
			this.day();
		}
		if (event === "week") {
			this.week();
		}
	}

	tick(){

	}

	hour(){

	}

	day(){

		this.updateAvailableBuildings(3);
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
				return `Increase deliveries by ${building.num}/hour`
			case "waterBuilding":
				return `Produces ${building.num} gallons of water/hour`
			case "farmBuilding":
				return `Produces up to ${building.num} beans/hour`
			case "researchBuilding":
				return `Increase researcher population by ${building.num}`
			default:
				break;
		}
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
		
		return {
			name: randomName,
			type: buildingType,
			areaSize: data.areaSize,
			buyCost: data.cost * (1 + Math.floor(Math.random() * 10) / 10),
			sellCost: data.cost * (1 - Math.floor(Math.random() * 10) / 10),
			rent: data.rent,
			num: data.num
		};
	}

	BuildingList: Record<BuildingType, Record<BuildingSize, BuildingData>> = {
		coffeeBuilding: {
			small: { names: ["Little Bean", "Mini Mocha"], cost: 1000, num: 20, areaSize: 1, rent: 100 },
			medium: { names: ["Central Perk", "Daily Grind"], cost: 2000, num: 40, areaSize: 2, rent: 200 },
			large: { names: ["Coffee Empire", "Mocha Megaplex"], cost: 5000, num: 80, areaSize: 4, rent: 500 }
		},
		housingBuilding: {
			small: { names: ["Tiny Homes", "Cozy Cabins"], cost: 1000, num: 300, areaSize: 1, rent: 150 },
			medium: { names: ["Suburb House", "Town Villa"], cost: 2000, num: 500, areaSize: 2, rent: 300 },
			large: { names: ["Luxury Apartments", "Highrise Living"], cost: 5000, num: 1000, areaSize: 4, rent: 700 }
		},
		importBuilding: {
			small: { names: ["Mini Dock", "Petite Port"], cost: 1000, num: 1000, areaSize: 2, rent: 250 },
			medium: { names: ["City Import Hub", "Regional Docks"], cost: 2000, num: 2000, areaSize: 3, rent: 500 },
			large: { names: ["International Port", "Global Exchange"], cost: 5000, num: 4000, areaSize: 5, rent: 1000 }
		},
		exportBuilding: {
			small: { names: ["Small Shipping Co.", "Local Exporters"], cost: 1000, num: 1000, areaSize: 2, rent: 250 },
			medium: { names: ["Export Hub", "Regional Traders"], cost: 2000, num: 2000, areaSize: 3, rent: 500 },
			large: { names: ["Worldwide Export HQ", "Global Freight Center"], cost: 5000, num: 4000, areaSize: 5, rent: 1000 }
		},
		deliveryBuilding: {
			small: { names: ["Courier Station", "Tiny Depot"], cost: 1000, num: 100, areaSize: 1, rent: 120 },
			medium: { names: ["Regional Logistics", "Citywide Express"], cost: 2000, num: 200, areaSize: 2, rent: 250 },
			large: { names: ["National Dispatch Center", "Continental Couriers"], cost: 5000, num: 400, areaSize: 4, rent: 600 }
		},
		waterBuilding: {
			small: { names: ["Small Water Plant", "Tiny Aqueduct"], cost: 1000, num: 50, areaSize: 1, rent: 110 },
			medium: { names: ["City Waterworks", "Municipal Reservoir"], cost: 2000, num: 100, areaSize: 2, rent: 220 },
			large: { names: ["Mega Water Facility", "Continental Hydration"], cost: 5000, num: 200, areaSize: 4, rent: 500 }
		},
		farmBuilding: {
			small: { names: ["Family Farm", "Urban Garden"], cost: 1000, num: 30, areaSize: 2, rent: 180 },
			medium: { names: ["Regional Farm", "Commercial Orchard"], cost: 2000, num: 60, areaSize: 3, rent: 360 },
			large: { names: ["Industrial Farm Complex", "Agro-Enterprise Zone"], cost: 5000, num: 120, areaSize: 5, rent: 800 }
		},
		researchBuilding: {
			small: { names: ["R&Deez", "Lil Lab"], cost: 1000, num: 50, areaSize: 1, rent: 110 },
			medium: { names: ["The Idea Generator", "The Research Gallery"], cost: 2000, num: 100, areaSize: 2, rent: 220 },
			large: { names: ["The Big Think", "Super Mega Lab"], cost: 5000, num: 200, areaSize: 4, rent: 500 }
		}
	};
}


