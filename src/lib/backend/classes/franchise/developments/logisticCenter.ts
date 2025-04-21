import { DevelopmentBase, DevelopmentType } from "./developmentbase";

export class LogisticCenter extends DevelopmentBase{
    get developmentType(): DevelopmentType {
        return DevelopmentType.Logistic;
      }

    initializeDevelopment(): void {
        //put all the logistic center specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
        this.updateAvailableBuildings(3); //these should be displayed on the frontend
    }
    
    updateAvailableBuildings(buildingCount: number): void {
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
        whatDo: function (): string {
            return `Increases import by ${this.importIncrease}`;
          }
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
        whatDo: function (): string {
            return `Increase import by ${this.importIncrease}`;
          }
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
        whatDo: function (): string {
            return `Increase export by ${this.exportIncrease}`;
          }
          
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
        whatDo: function (): string {
            return `Increase export by ${this.exportIncrease}`;
          }
      } as ExportBuilding)

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

