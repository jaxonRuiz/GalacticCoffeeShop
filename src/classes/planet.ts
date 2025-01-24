interface PlanetConfig {
  name: string;
  land: number;
  population: number;
  appeal: number;
  purchasingPower: number;
  servicibility: number;
  beans: number; // total beans on planet (?)
  beanFactor: number; // speed factor at which beans can be collected
}

interface BuildingEffects {
  appeal?: number;
  purchasingPower?: number;
  servicibility?: number;
  population?: number;
  beans?: number;
  beanFactor?: number;
  coffeeCapacity?: number;
}

interface Building {
  name: string;
  cost: number;
  size: number;
  effect: BuildingEffects;
}

interface Infrastructure {
  name: string;
  cost: number;
}

export class Planet {
  // planet info
  name: string;
  totalLand: number;
  usedLand = 0;

  // planet stats (can also be done with a map)
  stats: { [key: string]: number } = {
    population: 0,
    appeal: 0,
    purchasingPower: 0,
    servicibility: 0,
    beans: 0,
    beanFactor: 0,
    coffeeCapacity: 0,
    beanCollectors: 0,
    supplies: 0,
  };

  // planet upgrades
  buildings: Building[] = [];
  infrastructure: Infrastructure[] = [];

  constructor(config: PlanetConfig) {
    this.name = config.name;
    this.totalLand = config.land;

    // loading stats
    this.stats.population = config.population;
    this.stats.appeal = config.appeal;
    this.stats.purchasingPower = config.purchasingPower;
    this.stats.servicibility = config.servicibility;
    this.stats.beans = config.beans;
    this.stats.beanFactor = config.beanFactor;
  }

  // WIP TODO
  tick() {
    // production of beans to supplies
    this.stats.supplies = this.stats.beanCollectors * this.stats.beanFactor;
  }

  addBuilding(building: Building) {
    if (this.usedLand + building.size > this.totalLand) {
      console.log("Not enough land");
      return;
    }

    this.buildings.push(building);
    this.usedLand += building.size;
    console.log("placing building: ", building.name);
    for (let key in building.effect) {
      this.stats[key] += building.effect[key as keyof BuildingEffects]!;
    }
  }

  removeBuilding(building: Building) {
    this.buildings = this.buildings.filter((b) => b !== building);
    this.usedLand -= building.size;
    for (let key in building.effect) {
      this.stats[key] -= building.effect[key as keyof BuildingEffects]!;
    }
  }
}
