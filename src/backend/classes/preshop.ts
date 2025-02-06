import { Observer } from "../systems/observer";
import { get, type Writable, writable } from "svelte/store";

export class Preshop implements Subscriber {
  // resources (setting writable to interact with svelte)
  // not to be used in backend
  w_money: Writable<number> = writable(0);
  w_beans: Writable<number> = writable(5);
  w_groundCoffee: Writable<number> = writable(0);
  w_coffeeCups: Writable<number> = writable(0);
  w_waitingCustomers: Writable<number> = writable(0);
  w_appeal: Writable<number> = writable(0);
  w_beanPrice: Writable<number> = writable(5.99);
  w_grindProgress: Writable<number> = writable(-1); // -1 means not grinding

  // internal stats
  coffeePrice: number = 3.5;
  beansPerBuy: number = 4; // how many beans are bought at a time
  coffeePerBean: number = 5;
  grindTime: number = 5; // number of times to click to grind a bean
  customerProgress: number = 0; // progress to next customer
  promotionEffectiveness: number = 0.1; // current rate of customer generation
  appealDecay: number = 0.05; // rate of decay of customer appeal
  maxCustomers: number = 5;
  maxAppeal: number = 0.7;
  coffeeQuantity: number = 1; // how many cups of coffee are made per run

  // stat counters
  lifetimeGrindBeans: number = 0;
  lifetimeCoffeeSold: number = 0;
  lifetimeCoffeeMade: number = 0;

  // contains list of upgrades (IDs) and their levels
  upgrades: Map<string, number> = new Map();

  // abstracting svelte store from normal usage (allows use of writables in backend)
  // resources
  get money() {
    return get(this.w_money);
  }
  set money(value) {
    this.w_money.set(value);
  }
  get beans() {
    return get(this.w_beans);
  }
  set beans(value) {
    this.w_beans.set(value);
  }
  get groundCoffee() {
    return get(this.w_groundCoffee);
  }
  set groundCoffee(value) {
    this.w_groundCoffee.set(value);
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

  // stats
  get appeal() {
    return get(this.w_appeal);
  }
  set appeal(value) {
    this.w_appeal.set(value);
  }
  get beanPrice() {
    return get(this.w_beanPrice);
  }
  set beanPrice(value) {
    this.w_beanPrice.set(value);
  }
  get grindProgress() {
    return get(this.w_grindProgress);
  }
  set grindProgress(value) {
    this.w_grindProgress.set(value);
  }

  constructor(timer: Observer) {
    timer.subscribe(this, "tick");
    timer.subscribe(this, "hour");
    timer.subscribe(this, "week");
  }

  notify(event: string, data?: any) {
    if (event === "tick") {
      this.tick();
    }
    if (event === "hour") {
      if (this.waitingCustomers > 0) {
        this.waitingCustomers--;
      }
      // this.decayAppeal();
    }
    if (event === "week") {
      console.log("week end", data);
      // give weekly recap receipt
    }
  }

  tick() {
    this.drawCustomers();
    this.decayAppeal();
  }

  drawCustomers() {
    if (this.appeal > 0) {
      // customer generation
      this.customerProgress += this.appeal;
      if (this.customerProgress >= 1) {
        this.waitingCustomers += Math.floor(this.customerProgress);
        this.waitingCustomers = Math.min(
          this.waitingCustomers,
          this.maxCustomers
        );
        this.customerProgress %= 1;
      }
    }
  }

  decayAppeal() {
    // appeal decay
    if (this.appeal > 0.00005) {
      this.appeal = this.appeal * (1 - this.appealDecay);
    } else {
      this.appeal = 0;
    }
  }

  // TODO make appeal diminishing effectiveness
  promoteShop() {
    this.appeal +=
      this.promotionEffectiveness * (1 - this.appeal / this.maxAppeal);
    this.appeal = Math.min(this.appeal, this.maxAppeal);
  }

  sellCoffee() {
    if (this.coffeeCups <= 0) return;

    if (this.waitingCustomers > 0) {
      this.waitingCustomers--;
      this.coffeeCups--;
      this.money += this.coffeePrice;
      this.lifetimeCoffeeSold++;
    }
  }

  grindBeans() {
    if (this.beans <= 0 && this.grindProgress == -1) return;

    // if finished grinding
    if (this.grindProgress >= this.grindTime) {
      this.groundCoffee += this.coffeePerBean;
      this.grindProgress = -1;
      this.lifetimeGrindBeans++;
    }

    // if not grinding yet
    else if (this.grindProgress === -1) {
      this.grindProgress = 1;
      this.beans--;
    }

    // if grinding
    else {
      this.grindProgress++;
    }
  }

  makeCoffee() {
    if (this.groundCoffee <= 0) return;

    console.log("making coffee");
    // possibly add cooldown or timer effect
    this.groundCoffee -= this.coffeeQuantity;
    this.coffeeCups += this.coffeeQuantity;
    this.lifetimeCoffeeMade += this.coffeeQuantity;
  }

  buyBeans() {
    // possibly make bean cost scale or change over time(?)
    if (this.money < this.beanPrice) return;
    this.beans += this.beansPerBuy;
    this.money -= this.beanPrice;
  }

  saveState() {
    localStorage.setItem("preshop", JSON.stringify(this));
  }

  loadState() {
    const state = localStorage.getItem("preshop");
    if (state) {
      Object.assign(this, JSON.parse(state));
    }
  }

  applyCost(cost: number) {
    // if (this.money < cost) return; // flag something? DEBT
    this.money -= cost;
  }
}
