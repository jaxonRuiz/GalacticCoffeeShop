import { MultiShop } from "./multiShop";
import { get, type Writable, writable } from "svelte/store";

export class Shop {
  // writable resources
  w_beans: Writable<number> = writable(0);
  w_emptyCups: Writable<number> = writable(0);
  w_coffeeCups: Writable<number> = writable(0); // sellable coffee
  w_waitingCustomers: Writable<number> = writable(0);
  w_money: Writable<number> = writable(0);
  w_appeal: Writable<number> = writable(0);

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
  get money() {
    return get(this.w_money);
  }
  set money(value) {
    this.w_money.set(value);
  }
  get appeal() {
    return get(this.w_appeal);
  }
  set appeal(value) {
    this.w_appeal.set(value);
  }

  // is an object instead of map because fixed entries
  restockSheet: { [key: string]: number } = {
    beans: 0,
    coffeeCups: 0,
  };
  workerRates: { [key: string]: number } = {
    baristaProductivity: 0.2,
    serverProductivity: 0.5,
  };
  progressTrackers: { [key: string]: number } = {
    serviceProgress: 0,
    coffeeProgress: 0,
    promoteProgress: 0,
  };

  coffeePrice: number = 5;
  roles: Map<string, Role> = new Map();
  totalWorkers: number = 0;
  freeWorkers: number = 0;
  maxCustomers: number = 7;
  promotionEffectiveness: number = 0.2;
  minimumAppeal: number = 0.1;
  maxAppeal: number = 2;

  constructor() {
    // setting up default roles
    this.roles.set("barista", {
      name: "Barista",
      numWorkers: 0,
      maxWorkers: 1,
      wage: 50,
      update: (shop: Shop) => {
        let barista = shop.roles.get("barista")!;
        if (shop.beans >= 1 && shop.emptyCups >= 1) {
          shop.progressTrackers["coffeeProgress"] +=
            shop.workerRates["baristaProductivity"] * barista.numWorkers;
        }
      },
    });

    this.roles.set("server", {
      name: "Server",
      numWorkers: 0,
      maxWorkers: 1,
      wage: 50,
      update: (shop: Shop) => {
        let server = shop.roles.get("server")!;
        if (shop.waitingCustomers > 0 && shop.coffeeCups > 0) {
          shop.progressTrackers["serviceProgress"] +=
            shop.workerRates["serverProductivity"] * server.numWorkers;
        }
        if (shop.progressTrackers["serviceProgress"] >= 1) {
          shop.sellCoffee();
        }
      },
    });
  }

  tick(owner: MultiShop) {
    console.log("shop ticked");
    this.roles.forEach((role: Role) => {
      role.update(this);
    });

    // (should have used map)
    if (this.progressTrackers["coffeeProgress"] >= 1) {
      if (this.produceCoffee()) this.progressTrackers["coffeeProgress"] -= 1;
    }
    if (
      this.progressTrackers["appealProgress"] >= 1 &&
      this.waitingCustomers < this.maxCustomers
    ) {
      this.waitingCustomers++;
      this.progressTrackers["appealProgress"] -= 1;
    }
    if (this.progressTrackers["serviceProgress"] >= 1) {
      if (this.sellCoffee()) this.progressTrackers["serviceProgress"] -= 1;
    }
  }

  // actions
  produceCoffee() {
    if (this.beans >= 1 && this.emptyCups >= 1) {
      this.beans--;
      this.emptyCups--;
      this.coffeeCups++;
      return true;
    }
    return false;
  }

  sellCoffee() {
    if (this.waitingCustomers >= 1) {
      this.coffeeCups--;
      this.waitingCustomers--;
      this.money += this.coffeePrice;
      return true;
    }
    return false;
  }

  promote() {

  }

  withdrawMoney() {
    let money = this.money;
    this.money = 0;
    return money;
  }

  // TODO frame to unlock new jobs
  unlockSupplier() {
    this.roles.set("supplier", {
      name: "Supplier",
      numWorkers: 0,
      maxWorkers: 1,
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
  update: (owner: Shop) => void;
}
