import { MultiShop } from "./multiShop";
import { get, type Writable, writable } from "svelte/store";

export class Shop {
  // writable resources
  w_beans: Writable<number> = writable(0);
  w_emptyCups: Writable<number> = writable(0);
  w_coffeeCups: Writable<number> = writable(0); // sellable coffee
  w_waitingCustomers: Writable<number> = writable(0);

  // writable getters/setters
  get beans() {
    return get(this.w_beans);
  }
  set beans(value) {
    this.w_beans.set(value);
  }
  get emptyCups() {
    return get(this.w_emptyCups);
  }
  set emptyCups(value) {
    this.w_emptyCups.set(value);
  }
  get coffeeCups() {
    return get(this.w_coffeeCups);
  }
  set coffeeCups(value) {
    this.w_coffeeCups.set(value);
  }
  get waitingCustomers() {
    return get(this.w_waitingCustomers);
  }
  set waitingCustomers(value) {
    this.w_waitingCustomers.set(value);
  }

  restockSheet: { [key: string]: number } = {
    beans: 0,
    coffeeCups: 0,
  };
  roles: Map<string, Role> = new Map();
  totalWorkers: number = 0;
  freeWorkers: number = 0;
  constructor() {
    this.roles.set("barista", {
      name: "Barista",
      numWorkers: 0,
      maxWorkers: 1,
      wage: 50,
      rates: {
        coffeeProduction: 0.2,
        beanConsumption: 0.5,
      },
      update: (shop: Shop) => {
        let barista = shop.roles.get("barista")!;
        if (
          shop.beans > barista.rates["beanConsumption"] &&
          shop.emptyCups > barista.rates["coffeeProduction"]
        ) {
          shop.beans -= barista.rates["beanConsumption"];
          shop.emptyCups -= barista.rates["coffeeProduction"];
          shop.coffeeCups += barista.rates["coffeeProduction"];
        }
      },
    });
  }

  tick(owner: MultiShop) {
    console.log("shop ticked");
    this.roles.forEach((role: Role) => {
      role.update(this);
    });
  }

  unlockSupplier() {
    this.roles.set("supplier", {
      name: "Supplier",
      numWorkers: 0,
      maxWorkers: 1,
      rates: {},
      wage: 100,
      update: (owner: Shop) => {
        console.log("supplier updated");
      },
    });
  }
}

interface Role {
  name: string;
  numWorkers: number;
  maxWorkers: number;
  wage: number; // weekly
  rates: { [key: string]: number };
  update: (owner: Shop) => void;
}
