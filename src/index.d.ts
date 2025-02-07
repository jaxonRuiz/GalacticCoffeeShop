// global interfaces, no enums

interface Upgrade {
  name: string;
  description: string;
  unlock_condition: (shop: ShopObject) => boolean;
  upgrade: (shop: ShopObject, level: number) => void; // LEVELS USE 1 BASED INDEXING
  maxLevel: number | undefined; // undefined means infinite upgrade
  cost: number;
  costMultiplier: number;
  flags?: string[];
  image: string;
}

interface UpgradeManager {
  allUpgrades: { [key: string]: Upgrade };

  applyUpgrade(id: string, shopObject: Shop): void;
  getCost(id: string, shopObject: Shop): number;
  checkUpgrade(shopObject: Shop): string[];
}

interface Shop {
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
  minimumAppeal: number;
  coffeeQuantity: number;
}

interface ShopObject extends Shop {
  shops?: Shop[];
}

interface Subscriber {
  notify(event: string, data?: any): void;
}
/*
classes that implement subscriber should implement a 
notify(event: string, data?: any) method that does a behavior
dont forget to add the subscriber to the observer with .subscribe()
*/
