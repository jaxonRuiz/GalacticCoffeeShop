// global interfaces, no enums
interface IUpgrade {
  unlock_condition: (shop: IShop | IMultiShop | IPreshop | ILocalShop) => boolean;
  upgrade: (shop: IShop | IMultiShop | IPreshop | ILocalShop, level: number) => void; // LEVELS USE 1 BASED INDEXING
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
  endScene(): void;
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
  autosellEnabled: boolean;
  lifetimeCoffeeSold: number;
  lifetimeCoffeeMade: number;
  lifetimeGrindBeans: number;
}

interface IMultiShop extends IShop {
  money: number;
  minAppeal: number;
  promotionEffectiveness: number;
}

interface ILocalShop extends IShop {
  money: number;
  appeal: number;
  restockSheet: { [key: string]: number };
  workerRates: { [key: string]: number };
  progressTrackers: { [key: string]: number };
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

  roles: Map<string, Role>;
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
