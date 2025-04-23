import { get, type Writable, writable } from "svelte/store";
import { DevelopmentBase, DevelopmentType } from "./developmentbase";
import type { Publisher } from "$lib/backend/systems/observer";
import type { Region } from "../region";
import type { Franchise } from "../franchise";

export class Residential extends DevelopmentBase implements IResidential{
    get developmentType(): DevelopmentType {
        return DevelopmentType.Residential;
    }

    
    w_income: Writable<number> = writable(); //income per day? just to show the player how much their place is making

    
    get income(){
      return get(this.w_income);
    }
    set income(value){
      this.w_income.set(value);
    }

    //internal variables
    populationPurchasingPower: number = 1;

    totalMaxCoffeePerHour: number = 0;

    get coffeePrice(): number{
      return 5 * this.populationPurchasingPower;
    }

    get hourlyCustomerEstimate(): number{
      return this.parent.population/20;
    }

    constructor(timer: Publisher, region: Region, areaSize: number, franchise: Franchise) {
            super(timer, region, areaSize, franchise);
            this.initializeDevelopment();
        }

    sellCoffee(coffeeAmount: number){
      if (coffeeAmount > this.parent.beans){
        this.parent.parentCountry.importBeansTo(coffeeAmount - this.parent.beans, this.parent); //try to import as much as possible
      }
      var coffeeSold = Math.min(coffeeAmount, this.parent.beans);

      this.parent.beans -= coffeeSold;
      this.franchise.money += coffeeSold * this.coffeePrice;
    }

    initializeDevelopment(): void {
        //put all the city specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
        const self = this;
        if (this.franchise.firstCity){
          this.buyBuilding({
            name: "Corner Cafe",
            desc: "Cute cafe on the corner",
            areaSize: 1,
            buyCost: 0,
            sellCost: 800 - Math.floor(Math.random() * 50),
            rent: 50,
            maxCoffeePerHour: 100,
            onBuy: function () {
              self.totalMaxCoffeePerHour += this.maxCoffeePerHour;
            },
            onSell: function () {
              self.totalMaxCoffeePerHour -= this.maxCoffeePerHour;
            },
            onTick: function () {
              self.sellCoffee(self.coffeesToSell(this.maxCoffeePerHour));
            },
            onHour: function () {
            },
            onDay: function () {
              self.franchise.money -= this.rent;
            },
            onWeek: function () {
            },
            whatDo: function (): string {
              return `Sells ${this.maxCoffeePerHour} coffees per hour (if you got the beans)`;
            }
          } as CoffeeBuilding)
          this.franchise.firstCity = false;
        }

        this.updateAvailableBuildings(3); //these should be displayed on the frontend
    }

    coffeesToSell(maxCoffeePerHour: number): number{
      return Math.floor(this.hourlyCustomerEstimate* maxCoffeePerHour/this.totalMaxCoffeePerHour * (1 + Math.random() * 0.2) / 16);
    }
    
    updateAvailableBuildings(buildingCount: number): void {
      const self = this;
      this.availableBuildings = [];
      
      let possibleBuildings = [];
      possibleBuildings.push({
        name: "Coffee Skyscraper",
        desc: "A towering coffee-themed building",
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
          self.sellCoffee(self.coffeesToSell(this.maxCoffeePerHour));
        },
        onHour: function () {
        },
        onDay: function () {
          self.franchise.money -= this.rent;
        },
        onWeek: function () {

        },
        whatDo: function (): string {
          return `Sells ${this.maxCoffeePerHour} coffees per hour (if you got the beans)`;
        }
      } as CoffeeBuilding)

      possibleBuildings.push({
        name: "Corner Cafe",
        desc: "Cute cafe on the corner",
        areaSize: 1,
        buyCost: 800 + Math.floor(Math.random() * 400),
        sellCost: 800 - Math.floor(Math.random() * 50),
        rent: 50,
        maxCoffeePerHour: 100,
        onBuy: function () {
          self.totalMaxCoffeePerHour += this.maxCoffeePerHour;
        },
        onSell: function () {
          self.totalMaxCoffeePerHour -= this.maxCoffeePerHour;
        },
        onTick: function () {
          self.sellCoffee(self.coffeesToSell(this.maxCoffeePerHour));
        },
        onHour: function () {
        },
        onDay: function () {
          self.franchise.money -= this.rent;
        },
        onWeek: function () {

        },
        whatDo: function (): string {
          return `Sells ${this.maxCoffeePerHour} coffees per hour (if you got the beans)`;
        }
      } as CoffeeBuilding)

      possibleBuildings.push({
          name: "Apartment Building",
          desc: "20 stories of solid concrete",
          areaSize: 2,
          buyCost: 1600 + Math.floor(Math.random() * 800),
          sellCost: 1600 - Math.floor(Math.random() * 200),
          rent: 200,
          populationIncrease: 1000 +  Math.floor(Math.random() * 300),
          onBuy: function () {
            self.parent.population += this.populationIncrease;
          },
          onSell: function () {
            self.parent.population -= this.populationIncrease;
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
          whatDo: function (): string {
            return `Increases population by ${this.populationIncrease}`;
          }
        } as HousingBuilding)

        possibleBuildings.push({
          name: "Motel",
          desc: "The rooms have yellow walls and suspicious stains",
          areaSize: 1,
          buyCost: 600 + Math.floor(Math.random() * 300),
          sellCost: 600 - Math.floor(Math.random() * 50),
          rent: 200,
          populationIncrease: 500 +  Math.floor(Math.random() * 100),
          onBuy: function () {
            self.parent.population += this.populationIncrease;
          },
          onSell: function () {
            self.parent.population -= this.populationIncrease;
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
          whatDo: function (): string {
            return `Increases population by ${this.populationIncrease}`;
          }
        } as HousingBuilding)

        possibleBuildings.push({
          name: "Bean Store",
          desc: "Imports high quality Columbian coffee beans",
          areaSize: 1,
          buyCost: 800 + Math.floor(Math.random() * 100),
          sellCost: 800 - Math.floor(Math.random() * 100),
          rent: 200,
          beansPerHour: 100,
          beanCost: 3 + Math.floor(Math.random() * 3),
          onBuy: function () {
            
          },
          onSell: function () {
            
          },
          onTick: function () {
        
          },
          onHour: function () {
            if (self.franchise.money >= this.beansPerHour * this.beanCost){
              self.parent.beans += this.beansPerHour;
              self.franchise.money -= this.beansPerHour * this.beanCost
            }
          },
          onDay: function () {
            self.franchise.money -= this.rent;
          },
          onWeek: function () {
        
          },
          whatDo: function (): string {
            return `Buys ${this.beansPerHour} off of the free market`;
          }
        } as BeanBuilding)

        possibleBuildings.push({
          name: "Bean Dispensary",
          desc: "Smells like a mix of coffee and weed",
          areaSize: 1,
          buyCost: 1600 + Math.floor(Math.random() * 800),
          sellCost: 1600 - Math.floor(Math.random() * 200),
          rent: 200,
          beansPerHour: 800,
          beanCost: 2 + Math.floor(Math.random() * 3),
          onBuy: function () {
            
          },
          onSell: function () {
            
          },
          onTick: function () {
        
          },
          onHour: function () {
            if (self.franchise.money >= this.beansPerHour * this.beanCost){
              self.parent.beans += this.beansPerHour;
              self.franchise.money -= this.beansPerHour * this.beanCost;
            }
          },
          onDay: function () {
            self.franchise.money -= this.rent;
          },
          onWeek: function () {
        
          },
          whatDo: function (): string {
            return `Buys ${this.beansPerHour} off of the free market`;
          }
        } as BeanBuilding)

        this.availableBuildings = this.getRandomSubset(possibleBuildings, buildingCount);
    }
  
    getRandomSubset<T>(array: T[], count: number): T[] {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, count);
    }
    
}

