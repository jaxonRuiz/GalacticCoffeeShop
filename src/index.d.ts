// global interfaces, no enums

interface IUpgrade {
  name: string;
  description: string;
  unlock_condition: (shop: IShop) => boolean;
  upgrade: (shop: IShop, level: number) => void; // LEVELS USE 1 BASED INDEXING
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
  coffeePrice: number;
  beansPerBuy: number;
  coffeePerBean: number;
  grindTime: number;
  customerProgress: number;
  promotionEffectiveness: number;
  appealDecay: number;
  upgrades: Map<string, number>;
  applyCost(cost: number): void;
  // upgrades: {[keys: string]: number};
  // writables
  money: number;
  beans: number;
  groundCoffee: number;
  coffeeCups: number;
  waitingCustomers: number;
  appeal: number;
  beanPrice: number;
  grindProgress: number;

  minimumAppeal?: number;
  coffeeQuantity?: number;
  grindQuantity: number;
  lifetimeCoffeeSold: number;
  lifetimeCoffeeMade: number;
  lifetimeGrindBeans: number;
  shops?: IShop[];
  endScene(): void;
}

interface IScene {
  endScene(): void;
}

interface ISubscriber {
  notify(event: string, data?: any): void;
}
/*
classes that implement subscriber should implement a
notify(event: string, data?: any) method that does a behavior
dont forget to add the subscriber to the observer with .subscribe()
*/
