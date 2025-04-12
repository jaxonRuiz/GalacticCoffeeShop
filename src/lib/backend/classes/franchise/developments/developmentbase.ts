import { Publisher } from "../../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../../shop";
import { UpgradeManager } from "../../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../../systems/audioManager";
import { aud } from "../../../../assets/aud";
import type { Region } from "../region";

export enum DevelopmentType{
    City = "City",
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

    sceneManager: Publisher;
    parent: Region;
    
    constructor(timer: Publisher, sceneManager: Publisher, region: Region, areaSize: number, cost: number) {
        timer.subscribe(this, "tick");
        timer.subscribe(this, "hour");
        timer.subscribe(this, "week");
        this.sceneManager = sceneManager;
        this.parent = region;
        this.developmentArea = areaSize;
        this.developmentCost = cost;

        this.InitializeDevelopment();
    }

    notify(event: string, data?: any) {
		// maybe optimize better :/ dont need to call every shop every tick
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

    InitializeDevelopment(){

    }
}