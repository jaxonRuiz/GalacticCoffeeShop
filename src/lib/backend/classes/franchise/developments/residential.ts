import { Publisher } from "../../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "../../shop";
import { UpgradeManager } from "../../../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../../../systems/audioManager";
import { aud } from "../../../../assets/aud";
import { DevelopmentBase, DevelopmentType } from "./developmentbase";
import type { Region } from "../region";
import { Building } from "./developmentbase";

export class Residential extends DevelopmentBase implements IResidential{
    get developmentType(): DevelopmentType {
        return DevelopmentType.Residential;
    }

    w_population: Writable<number> = writable(100);
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
    maxPopulation: number = this.developmentArea * 500;
    populationPurchasingPower: number = 1;

    totalMaxCoffeePerHour: number = 0;

    get coffeePrice(): number{
      return 5 * this.populationPurchasingPower;
    }

    get hourlyCustomerEstimate(): number{
      return this.population/20;
    }



    SellCoffee(coffeeAmount: number){
      if (coffeeAmount > this.parent.beans){
        this.parent.parentCountry.ImportBeansTo(coffeeAmount - this.parent.beans, this.parent); //try to import as much as possible
      }
      var coffeeSold = Math.min(coffeeAmount, this.parent.beans);

      this.parent.beans -= coffeeSold;
      this.franchise.money += coffeeSold * this.coffeePrice;
    }

    InitializeDevelopment(): void {
        //put all the city specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
        this.InitializePossibleBuildings();
        this.UpdateAvailableBuildings();
    }
    
    UpdateAvailableBuildings(): void {
      this.availableBuildings = [];
      
      
    }

    InitializePossibleBuildings(){
      const self = this;

      this.possibleBuildings.push({
        name: "Coffee Skyscraper",
        desc: 'A towering coffee-themed building occupying ${areaSize} tiles, ',
        areaSize: 3,
        buyCost: 1600 + Math.floor(Math.random() * 800),
        sellCost: 1600 - Math.floor(Math.random() * 200),
        rent: 200,
        maxCoffeePerHour: 500,
        onBuy: function () {
          self.totalMaxCoffeePerHour += this.maxCoffeePerHour;
        },
        onSell: function () {
          self.totalMaxCoffeePerHour -= this.maxCoffeePerHour;
        },
        onTick: function () {

        },
        onHour: function () {
          self.SellCoffee(self.hourlyCustomerEstimate * this.maxCoffeePerHour/self.totalMaxCoffeePerHour * (1 + Math.random() * 0.2));
        },
        onDay: function () {
          self.franchise.money -= this.rent;
        },
        onWeek: function () {

        },
      } as CoffeeBuilding)
    }
}

interface CoffeeBuilding extends Building{
  maxCoffeePerHour: number;
}



// this.possibleBuildings.push({
//   name: "",
//   desc: "",
//   areaSize: ,
//   buyCost: ,
//   sellCost: ,
//   rent: ,
//   onBuy: function () {

//   },
//   onSell: function () {

//   },
//   onTick: function () {

//   },
//   onHour: function () {

//   },
//   onDay: function () {

//   },
//   onWeek: function () {

//   },
// })