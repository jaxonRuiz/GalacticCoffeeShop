import { Publisher } from "../../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../../shop";
import { UpgradeManager } from "../../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../../systems/audioManager";
import { aud } from "../../../../assets/aud";
import type { Region } from "../region";
import { Franchise } from "../franchise";

export enum DevelopmentType{
    Residential = "Residential",
    Farm = "Farm",
    Logistic = "Logistic"
}

export class DevelopmentBase implements ISubscriber, IDevelopment{
    w_developmentCost: Writable<number> = writable(1000);
    w_developmentArea: Writable<number> = writable(10);
    w_developmentType: Writable<DevelopmentType> = writable();

    get developmentCost() {
        return get(this.w_developmentCost);
    }
    set developmentCost(value) {
        this.w_developmentCost.set(value);
    }
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

    boughtBuildings: Building[] = [];
    availableBuildings: Building[] = [];

    possibleBuildings: Building[] = [];

    sceneManager: Publisher;
    parent: Region;
    franchise: Franchise;

    currentArea: number;
    
    constructor(timer: Publisher, sceneManager: Publisher, region: Region, areaSize: number, cost: number, franchise: Franchise) {
        timer.subscribe(this, "tick");
        timer.subscribe(this, "hour");
        timer.subscribe(this, "day");
        timer.subscribe(this, "week");
        this.sceneManager = sceneManager;
        this.parent = region;
        this.developmentArea = areaSize;
        this.developmentCost = cost;
        this.franchise = franchise;

        this.currentArea = this.developmentArea

        this.InitializeDevelopment();
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
    }

    week(){
        this.boughtBuildings.forEach(building => building.onWeek());
    }

    InitializeDevelopment(){

    }

    BuyBuilding(building: Building){
        if (building.areaSize > this.currentArea || building.buyCost > this.franchise.money) {return;}

        this.franchise.money -= building.buyCost; //pay your dues
        this.currentArea -= building.areaSize;
        this.boughtBuildings.push(building); //add to bought buildings
        const index = this.availableBuildings.indexOf(building);
        if (index !== -1) {
            this.availableBuildings.splice(index, 1); // remove from available buildings
        }
        building.onBuy();
    }

    SellBuilding(building: Building){
        this.franchise.money += building.sellCost;
        this.currentArea += building.areaSize;
        const index = this.boughtBuildings.indexOf(building);
        if (index !== -1) {
            this.boughtBuildings.splice(index, 1); // remove from your bought buildings
        }
        building.onSell();
    }

    PayRent(){
        this.boughtBuildings.forEach(element => {
            this.franchise.money -= element.rent;
        });
    }

    UpdateAvailableBuildings(buildingCount: number){

    }
}


export interface Building {
    name: string;
    desc: string;
    areaSize: number;
    buyCost: number;
    sellCost: number;
    rent: number;
    onBuy: () => void;
    onSell: () => void;
    onTick: () => void;
    onHour: () => void;
    onDay: () => void;
    onWeek: () => void;
  }