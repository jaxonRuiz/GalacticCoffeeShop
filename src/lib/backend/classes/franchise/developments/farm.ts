import { get, type Writable, writable } from "svelte/store";
import { DevelopmentBase, DevelopmentType } from "./developmentbase";

export class Farm extends DevelopmentBase {
  get developmentType(): DevelopmentType {
    return DevelopmentType.Farm;
  }

  w_water: Writable<number> = writable(0);

  get water() {
    return get(this.w_water);
  }
  set water(value) {
    this.w_water.set(value);
  }

  initializeDevelopment(): void {
    //put all the city specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
    this.updateAvailableBuildings(3); //these should be displayed on the frontend
  }

  updateAvailableBuildings(buildingCount: number): void {
    const self = this;
    this.availableBuildings = [];

    let possibleBuildings = [];
    possibleBuildings.push({
      name: "Water Tower",
      desc: "Hope you're thirsty",
      areaSize: 1,
      buyCost: 800 + Math.floor(Math.random() * 200),
      sellCost: 800 - Math.floor(Math.random() * 100),
      rent: 50,
      waterPerDay: 500 * this.parent.environmentalFactors["waterAvailability"],
      onBuy: function () {
      },
      onSell: function () {
      },
      onTick: function () {
      },
      onHour: function () {
      },
      onDay: function () {
        self.franchise.money -= this.rent;
        self.water += this.waterPerDay;
      },
      onWeek: function () {
      },
    } as WaterBuilding);

    possibleBuildings.push({
      name: "Large Water Tower",
      desc: "Hope you're super thirsty",
      areaSize: 2,
      buyCost: 1000 + Math.floor(Math.random() * 400),
      sellCost: 1000 - Math.floor(Math.random() * 200),
      rent: 100,
      waterPerDay: 1000 * this.parent.environmentalFactors["waterAvailability"],
      onBuy: function () {
      },
      onSell: function () {
      },
      onTick: function () {
      },
      onHour: function () {
      },
      onDay: function () {
        self.franchise.money -= this.rent;
        self.water += this.waterPerDay;
      },
      onWeek: function () {
      },
    } as WaterBuilding);

    this.possibleBuildings.push({
      name: "Greenhouse",
      desc: "Grow some beans",
      areaSize: 2,
      buyCost: 600 + Math.floor(Math.random() * 200),
      sellCost: 600 - Math.floor(Math.random() * 100),
      rent: 0,
      beansPerHour: 100 +
        Math.floor(Math.random() * 20) *
          this.parent.environmentalFactors["soilRichness"],
      onBuy: function () {
      },
      onSell: function () {
      },
      onTick: function () {
      },
      onHour: function () {
      },
      onDay: function () {
        self.franchise.money -= this.rent;
        var b = Math.min(this.beansPerHour, self.water);
        self.parent.beans += b;
        self.water -= b;
      },
      onWeek: function () {
      },
    } as FarmBuilding);

    this.possibleBuildings.push({
      name: "Field",
      desc: "Grow loads of beans",
      areaSize: 4,
      buyCost: 1200 + Math.floor(Math.random() * 400),
      sellCost: 1200 - Math.floor(Math.random() * 100),
      rent: 0,
      beansPerHour: 200 +
        Math.floor(Math.random() * 50) *
          this.parent.environmentalFactors["soilRichness"],
      onBuy: function () {
      },
      onSell: function () {
      },
      onTick: function () {
      },
      onHour: function () {
      },
      onDay: function () {
        self.franchise.money -= this.rent;
        var b = Math.min(this.beansPerHour, self.water);
        self.parent.beans += b;
        self.water -= b;
      },
      onWeek: function () {
      },
    } as FarmBuilding);

    this.availableBuildings = this.possibleBuildings.sort(() =>
      Math.random() - 0.5
    ).slice(0, buildingCount);
  }
}

