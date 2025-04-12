import { Publisher } from "../../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../../shop";
import { UpgradeManager } from "../../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../../systems/audioManager";
import { aud } from "../../../../assets/aud";
import { DevelopmentBase, DevelopmentType } from "./developmentbase";
import type { Region } from "../region";

export class Farm extends DevelopmentBase{
    get developmentType(): DevelopmentType {
        return DevelopmentType.Farm;
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

    InitializeDevelopment(): void {
        //put all the city specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
        
    }
}