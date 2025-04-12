import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../shop";
import { UpgradeManager } from "../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";
import type { DevelopmentBase, DevelopmentType } from "./developments/developmentbase";
import type { Country } from "./country";

export enum ClimateType{
	Arid = "Arid",
	Wintry = "Wintry",
	Temperate = "Temperate",
	Tropical = "Tropical",

}

export class Region implements ISubscriber, IRegion{
	//writables
    w_totalArea: Writable<number> = writable(100);
	w_developmentList: Writable<DevelopmentBase[]> = writable([]);
	w_environmentalFactors: Writable<{ [key: string]: number }> = writable({
		soilRichness: 0,
		waterAvailability: 0,
		averageTemp: 0,
	});
	w_accessibilityLevel: Writable<number> = writable(10);
	w_importCapacity: Writable<number> = writable(1000);
	w_exportCapacity: Writable<number> = writable(1000);
	
	//getters and setters
	get totalArea(){
		return get(this.w_totalArea);
	}
	set totalArea(value){
		this.w_totalArea.set(value);
	}
	get developmentList(){
		return get(this.w_developmentList);
	}
	set developmentList(value) {
		this.w_developmentList.set(value);
	}
	get environmentalFactors(){
		return get(this.w_environmentalFactors);
	}
	set environmentalFactors(value: { [key: string]: number }){
		this.w_environmentalFactors.set(value);
	}
	get accessibilityLevel(){
		return get(this.w_accessibilityLevel);
	}
	set accessibilityLevel(value){
		this.w_accessibilityLevel.set(value);
	}
	get importCapacity(){
		return get(this.w_importCapacity);
	}
	set importCapacity(value){
		this.w_importCapacity.set(value);
	}
	get exportCapacity(){
		return get(this.w_exportCapacity);
	}
	set exportCapacity(value){
		this.w_exportCapacity.set(value);
	}

	//internal variables
	unlockCost: number;
	coordinates: [number, number];

	sceneManager: Publisher;
    parent: Country;
    
    constructor(timer: Publisher, sceneManager: Publisher, country: Country, areaSize: number, cost: number, climate: ClimateType, coordinates: [number, number]) {
        timer.subscribe(this, "tick");
        timer.subscribe(this, "hour");
        timer.subscribe(this, "week");
        this.sceneManager = sceneManager;
        this.parent = country;
        this.totalArea = areaSize;
        this.unlockCost = cost;
		this.coordinates = coordinates;

        this.InitializeRegion(climate);
    }

    notify(event: string, data?: any) {
		if (event === "tick") {
			this.tick();
		}
		if (event === "day") {
			
		}
		if (event === "week") {
			
		}
	}

    tick(){

    }

	InitializeRegion(climate: ClimateType) {
		
	}

	AddDevelopment(developmentType: DevelopmentType){

	}
}