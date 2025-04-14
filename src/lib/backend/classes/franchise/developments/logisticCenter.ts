import { Publisher } from "../../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../../shop";
import { UpgradeManager } from "../../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../../systems/audioManager";
import { aud } from "../../../../assets/aud";
import { Building, DevelopmentBase, DevelopmentType } from "./developmentbase";
import type { Region } from "../region";

export class LogisticCenter extends DevelopmentBase{
    get developmentType(): DevelopmentType {
        return DevelopmentType.Logistic;
      }

    InitializeDevelopment(): void {
        //put all the logistic center specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
        this.UpdateAvailableBuildings(3); //these should be displayed on the frontend
    }
    
    UpdateAvailableBuildings(buildingCount: number): void {
      const self = this;
      this.availableBuildings = [];
      
      let possibleBuildings = [];
      possibleBuildings.push({
        name: "Coffee Warehouse",
        desc: "Store mad beans yo",
        areaSize: 1,
        buyCost: 800 + Math.floor(Math.random() * 200),
        sellCost: 800 - Math.floor(Math.random() * 100),
        rent: 50,
        importIncrease: 1000,
        onBuy: function () {
            self.parent.importCapacity += this.importIncrease;
        },
        onSell: function () {
            self.parent.importCapacity -= this.importIncrease;
        },
        onTick: function () {

        },
        onHour: function () {

        },
        onDay: function () {
            self.franchise.money -= this.rent;
        },
        onWeek: function () {

        },
      } as ImportBuilding)

      possibleBuildings.push({
        name: "Large Coffee Warehouse",
        desc: "Stors crazy mad beans yo",
        areaSize: 2,
        buyCost: 1200 + Math.floor(Math.random() * 400),
        sellCost: 1200 - Math.floor(Math.random() * 200),
        rent: 100,
        importIncrease: 2000,
        onBuy: function () {
            self.parent.importCapacity += this.importIncrease;
        },
        onSell: function () {
            self.parent.importCapacity -= this.importIncrease;
        },
        onTick: function () {

        },
        onHour: function () {

        },
        onDay: function () {
            self.franchise.money -= this.rent;
        },
        onWeek: function () {

        },
      } as ImportBuilding)

      possibleBuildings.push({
        name: "Distribution Hub",
        desc: "Supply EVERYWHERE with beans",
        areaSize: 2,
        buyCost: 1200 + Math.floor(Math.random() * 400),
        sellCost: 800 - Math.floor(Math.random() * 200),
        rent: 100,
        exportIncrease: 2000,
        onBuy: function () {
            self.parent.exportCapacity += this.exportIncrease;
        },
        onSell: function () {
            self.parent.exportCapacity -= this.exportIncrease;
        },
        onTick: function () {

        },
        onHour: function () {

        },
        onDay: function () {
            self.franchise.money -= this.rent;
        },
        onWeek: function () {

        },
      } as ExportBuilding)

      possibleBuildings.push({
        name: "Loading Dock",
        desc: "Send out loads of beans",
        areaSize: 1,
        buyCost: 800 + Math.floor(Math.random() * 200),
        sellCost: 800 - Math.floor(Math.random() * 100),
        rent: 50,
        exportIncrease: 1000,
        onBuy: function () {
            self.parent.exportCapacity += this.exportIncrease;
        },
        onSell: function () {
            self.parent.exportCapacity -= this.exportIncrease;
        },
        onTick: function () {

        },
        onHour: function () {

        },
        onDay: function () {
            self.franchise.money -= this.rent;
        },
        onWeek: function () {

        },
      } as ExportBuilding)

        this.availableBuildings = this.possibleBuildings.sort(() => Math.random() - 0.5).slice(0, buildingCount);
    }
}

interface ImportBuilding extends Building{
    importIncrease: number;
}

interface ExportBuilding extends Building{
    exportIncrease: number;
}