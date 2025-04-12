import { Publisher } from "../../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../../shop";
import { UpgradeManager } from "../../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../../systems/audioManager";
import { aud } from "../../../../assets/aud";
import { DevelopmentBase, DevelopmentType } from "./developmentbase";
import type { Region } from "../region";
import type { ICity } from "../../../..";

export class City extends DevelopmentBase implements ICity{
    get developmentType(): DevelopmentType {
        return DevelopmentType.City;
    }

    w_population: Writable<number> = writable(500);
    w_shopCount: Writable<number> = writable(1);
    w_income: Writable<number> = writable(); //income per day? just to show the player how much their place is making

    get population(){
      return get(this.w_population);
    }
    set population(value){
      this.w_population.set(value);
    }
    get shopCount(){
      return get(this.w_shopCount);
    }
    set shopCount(value){
      this.w_shopCount.set(value);
    }
    get income(){
      return get(this.w_income);
    }
    set income(value){
      this.w_income.set(value);
    }

    //internal variables
    maxPopulation: number = this.developmentArea * 200;
    populationPurchasingPower: number = 1;
    shopSize: number = 1; //can be upgraded
    beanCount: number = 0;

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

    InitializeDevelopment(): void {
        //put all the city specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
        
    }

    BuyShop() {
      
    }
}