// global interfaces, no enums

interface Upgrade {
  name: string;
  description: string;
  unlock_condition: (shop: Shop) => boolean;
  upgrade: (shop: Shop, level: number) => void;
  cost: number;
  cost_multiplier: number;
  image: string;
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
}

interface Subscriber {
  notify(event: string, data?: any): void;
}
/*
classes that implement subscriber should implement a 
notify(event: string, data?: any) method that does a behavior
dont forget to add the subscriber to the observer with .subscribe()
*/