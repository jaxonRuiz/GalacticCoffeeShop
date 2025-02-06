import { MultiShop } from "./multiShop";
import { get, type Writable, writable } from "svelte/store";

export class Shop {
  // writable resources
  w_beans: Writable<number> = writable(0);
  w_emptyCups: Writable<number> = writable(0);
  w_coffeeCups: Writable<number> = writable(0); // sellable coffee
  w_waitingCustomers: Writable<number> = writable(0);
  w_money: Writable<number> = writable(0); // local shop money is unusable untill collected
  w_appeal: Writable<number> = writable(0);
  w_cleanness: Writable<number> = writable(1);

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
  get cleanness() {
    return get(this.w_cleanness);
  }
  set cleanness(value) {
    this.w_cleanness.set(value);
  }

  // is an object instead of map because fixed entries
  restockSheet: { [key: string]: number } = {
    beans: 0,
    emptyCups: 0,
  };
  workerRates: { [key: string]: number } = {
    baristaProductivity: 0.2,
    serverProductivity: 0.5,
  };
  progressTrackers: { [key: string]: number } = {
    serviceProgress: 0,
    coffeeProgress: 0,
    promotionProgress: 0,
    customerProgress: 0,
  };

  coffeePrice: number = 5;
  beansPrice: number = 1;
  cupsPrice: number = 1;
  roles: Map<string, Role> = new Map();
  totalWorkers: number = 0;
  maxCustomers: number = 7;
  promotionEffectiveness: number = 0.2;
  minimumAppeal: number = 0.1;
  maxAppeal: number = 2;
  appealDecay: number = 0.05;

  upgrades: Map<string, number> = new Map();
  multiShop: MultiShop;

  constructor(multiShop: MultiShop) {
    this.multiShop = multiShop;
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
    this.roles.forEach((role: Role) => {
      role.update(this);
    });
    this.decayAppeal();

    // (should have used map)
    // may limit throughput to 1 thing per tick, maybe fix
    if (this.progressTrackers["coffeeProgress"] >= 1) {
      if (this.produceCoffee()) this.progressTrackers["coffeeProgress"] -= 1;
    }
    if (
      this.progressTrackers["customerProgress"] >= 1 &&
      this.waitingCustomers < this.maxCustomers
    ) {
      this.waitingCustomers++;
      this.progressTrackers["customerProgress"] -= 1;
    }
    if (this.progressTrackers["serviceProgress"] >= 1) {
      if (this.sellCoffee()) this.progressTrackers["serviceProgress"] -= 1;
    }
    if (this.progressTrackers["promotionProgress"] >= 1) {
      this.promote();
      this.progressTrackers["promotionProgress"] -= 1;
    }
  }

  // TODO check
  applyCost(cost: number) {
    this.money -= cost;
    if (this.money < 0) {
      this.multiShop.applyCost(Math.abs(this.money));
      this.money = 0;
      // apply debt?
    }
  }

  // actions ///////////////////////////////////////////////////////////
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
    this.appeal +=
      this.promotionEffectiveness * (1 - this.appeal / this.maxAppeal);
    this.appeal = Math.min(this.appeal, this.maxAppeal);
  }

  addWorker(role: string, multiShop: MultiShop) {
    if (!this.roles.has(role)) throw new Error("Role does not exist");
    let roleObj = this.roles.get(role);
    if (roleObj!.numWorkers < roleObj!.maxWorkers) {
      roleObj!.numWorkers++;
      // this.applyCost(roleObj!.wage*2); // hiring cost?
    }
  }

  removeWorker(role: string) {
    if (!this.roles.has(role)) throw new Error("Role does not exist");
    let roleObj = this.roles.get(role)!;
    if (roleObj.numWorkers > 0) {
      roleObj.numWorkers--;
    }
  }

  // shop management //////////////////
  restock(multiShop: MultiShop) {
    // !!! money is taken by getExpenses instead.
    // multiShop.money -= this.restockSheet["beans"] * this.beansPrice;
    // multiShop.money -= this.restockSheet["emptyCups"] * this.cupsPrice;

    this.beans += this.restockSheet["beans"];
    this.emptyCups += this.restockSheet["emptyCups"];
  }

  getTotalExpenses() {
    let totalExpenses = 0;
    this.roles.forEach((role: Role) => {
      totalExpenses += role.numWorkers * role.wage;
    });
    totalExpenses += this.beans * this.beansPrice;
    totalExpenses += this.emptyCups * this.cupsPrice;

    return totalExpenses;
  }

  // TODO make cleanness affect appeal decay
  decayAppeal() {
    // appeal decay
    if (this.appeal > 0.00005) {
      this.appeal = this.appeal * (1 - this.appealDecay);
    } else {
      this.appeal = 0;
    }
  }

  deselectShop() {
    this.multiShop.deselectShop();
  }

  // TODO frame to unlock new jobs
  unlockSupplier() {
    this.roles.set("supplier", {
      name: "Supplier",
      numWorkers: 0,
      maxWorkers: 1,
      wage: 100,
      update: (shop: Shop) => {
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
  update: (shop: Shop) => void;
}
