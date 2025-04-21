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
    w_boughtBuildings: Writable<Building[]> = writable([]);
    w_availableBuildings: Writable<Building[]> = writable([]);

    get boughtBuildings() {
        return get(this.w_boughtBuildings);
    }
    set boughtBuildings(value: Building[]) {
        this.w_boughtBuildings.set(value);
    }
    get availableBuildings() {
        return get(this.w_availableBuildings);
    }
    set availableBuildings(value: Building[]) {
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
        this.parent.unusedLand -= areaSize;

        this.initializeDevelopment();
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
        this.boughtBuildings.forEach(building => building.onTick());
    }

    hour(){
        this.boughtBuildings.forEach(building => building.onHour());
    }

    day(){
        this.boughtBuildings.forEach(building => building.onDay());
        this.updateAvailableBuildings(3);
    }

    week(){
        this.boughtBuildings.forEach(building => building.onWeek());
    }

    initializeDevelopment(){

    }

    buyBuilding(building: Building){
        if (building.areaSize > this.developmentArea || building.buyCost > this.franchise.money) {return;}

        this.franchise.money -= building.buyCost; //pay your dues
        this.developmentArea -= building.areaSize;
        this.boughtBuildings = [...this.boughtBuildings, building]; //add to bought buildings
        const index = this.availableBuildings.indexOf(building);
        if (index !== -1) {
            this.availableBuildings.splice(index, 1); // remove from available buildings
            this.availableBuildings = [...this.availableBuildings]; // update for svelte
        }
        building.onBuy();
    }

    sellBuilding(building: Building){
        this.franchise.money += building.sellCost;
        this.developmentArea += building.areaSize;
        const index = this.boughtBuildings.indexOf(building);
        if (index !== -1) {
            this.boughtBuildings.splice(index, 1); // remove from your bought buildings
            this.boughtBuildings = [...this.boughtBuildings]; // update for svelte
        }
        building.onSell();
    }

    payRent(){
        this.boughtBuildings.forEach(element => {
            this.franchise.money -= element.rent;
        });
    }

    updateAvailableBuildings(buildingCount: number){

    }

    increaseDevelopmentArea(areaSize: number = 1) {
		if (this.parent.unusedLand >= areaSize) {
			this.developmentArea += areaSize;
			this.parent.unusedLand -= areaSize;
		}
	}

	decreaseDevelopmentArea(areaSize: number = 1) {
		if (this.developmentArea - areaSize >= 0) {
			this.developmentArea -= areaSize;
			this.parent.unusedLand += areaSize;
		}
	}
}


