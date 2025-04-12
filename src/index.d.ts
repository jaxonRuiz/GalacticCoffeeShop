// global interfaces, no enums
interface IUpgrade {
  unlock_condition: (
    shop: IShop | IMultiShop | IPreshop | ILocalShop | IContainerShop,
  ) => boolean;
  upgrade: (
    shop: IShop | IMultiShop | IPreshop | ILocalShop | IScene,
    level: number,
  ) => void; // LEVELS USE 1 BASED INDEXING; IScene only used for endScene upgrades
  maxLevel: number | undefined; // undefined means infinite upgrade
  cost: number;
  costMultiplier: number;
  flags?: string[];
  image: string;
}

interface IUpgradeManager {
  allUpgrades: { [key: string]: IUpgrade };

  applyUpgrade(id: string, shopObject: IShop): void;
  getCost(id: string, shopObject: IShop): number;
  checkUpgrade(shopObject: IShop): string[];
}

interface IShop {
  upgrades: Map<string, number>;
  applyCost(cost: number): void;

  // upgrades: {[keys: string]: number};
  // writables

  shops?: IShop[];
}

interface IPreshop extends IShop {
  money: number;
  beans: number;
  groundCoffee: number;
  coffeeCups: number;
  waitingCustomers: number;
  appeal: number;
  beanPrice: number;
  grindProgress: number;
  makeCoffeeCooldown: number;
  makeCoffeeBatches: number;
  coffeePrice: number;
  beansPerBuy: number;
  coffeePerBean: number;
  grindTime: number;
  customerProgress: number;
  promotionEffectiveness: number;
  appealDecay: number;

  minAppeal?: number;
  maxAppeal?: number;
  maxCustomers?: number;
  makeCoffeeQuantity?: number;
  grindQuantity: number;
  autogrindingEnabled: boolean;
  autogrindInterval: number;
  autosellEnabled: boolean;
  autosellInterval: number;
  lifetimeCoffeeSold: number;
  lifetimeCoffeeMade: number;
  lifetimeGrindBeans: number;
}

// for classes which act as container to multiple shops
interface IContainerShop extends IShop {
  // upgradeFunctions: ((shop: Shop, level: number) => void)[];
  shops: IShop[];
  addShop(): void;
}

interface IMultiShop extends IContainerShop {
  money: number;
}

interface ILocalShop extends IShop {
  money: number;
  appeal: number;
  restockSheet: { [key: string]: number };
  workerStats: { [key: string]: number };
  roles: Map<string, Role>;
  minAppeal: number;
  maxAppeal: number;
  appealDecay: number;

  coffeePrice: number;
  beansPrice: number;
  cupsPrice: number;
  totalWorkers: number;
  maxCustomers: number;
  promotionEffectiveness: number;
  appealDecay: number;
  multiShopUnlocked: boolean;
  lifetimeStats: { [key: string]: number };
  workerAmounts: { [key: string]: number };
  promoterUnlocked: boolean;
  supplierUnlocked: boolean;

  roles: Map<string, Role>;
  unlockPromoter(): void;
  unlockSupplier(): void;
  unlockAutoRestock(): void;
}

interface IScene {
  endScene(): void;
  saveState(): void;
  loadState(): void;
  getTransferData(): any;
  loadTransferData(data: any): void;
}

interface ISubscriber {
  notify(event: string, data?: any): void;
}
/*
classes that implement subscriber should implement a
notify(event: string, data?: any) method that does a behavior
dont forget to add the subscriber to the observer with .subscribe()
*/

interface IDevelopment {
  parent: Region;
  developmentCost: number;
  developmentArea: number;
  developmentType: DevelopmentType;

  InitializeDevelopment();
}

interface ICity {
  population: number;
  shopCount: number;
  income: number;

  BuyShop();
}


interface IFarm {

}

interface IRegion {
  parentCountry: Country;
  totalArea: number;
  developmentList: { [key: string]: DevelopmentBase };
  environmentalFactors: { [key: string]: number };
  accessibilityLevel: number;
  importCapacity: number;
  exportCapacity: number;
  unlockCost: number;
  coordinates: [number, number];

  InitializeRegion(climate: ClimateType);
}

interface ICountry {
  parent: World;
  taxRate: number;
  tariffRate: number;
  regionList: Region[];
}

interface IWorld {

}
interface TimeData {
  tickProgress: number;
  hour: number;
  day: number;
  week: number;
  month: number;
  year: number;
}