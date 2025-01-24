import type { Subscriber } from "./observer";
import { Observer } from "./observer";
import { get, type Writable, writable } from "svelte/store";

export class Preshop implements Subscriber {
  // resources (setting writable to interact with svelte)
  w_money: Writable<number> = writable(0);
  w_beans: Writable<number> = writable(5);
  w_groundCoffee: Writable<number> = writable(0);
  w_coffeeCups: Writable<number> = writable(0);
  w_waitingCustomers: Writable<number> = writable(0);


  // stats
  coffeePrice: number = 3;
  coffeePerBean: number = 5;
  grindTime: number = 5; // number of times to click to grind a bean
  grindProgress: number = -1; // -1 means not grinding yet
  w_appeal: Writable<number> = writable(0.2); // affects customer draw per promotion
  customerProgress: number = 0; // progress to next customer
  // appeal: number = 0; // current rate of customer generation
  appealDecay: number = 0.05; // rate of decay of customer appeal

  // contains list of upgrades (IDs) and their levels
  upgrades: Map<string, number> = new Map();

  // abstracting svelte store from normal usage
  // resources
  get money() { return get(this.w_money); }
  set money(value) { this.w_money.set(value); }
  get beans() { return get(this.w_beans); }
  set beans(value) { this.w_beans.set(value); }
  get groundCoffee() { return get(this.w_groundCoffee); }
  set groundCoffee(value) { this.w_groundCoffee.set(value); }
  get coffeeCups() { return get(this.w_coffeeCups); }
  set coffeeCups(value) { this.w_coffeeCups.set(value); }
  get waitingCustomers() { return get(this.w_waitingCustomers); }
  set waitingCustomers(value) { this.w_waitingCustomers.set(value); }
  // stats
  get appeal() { return get(this.w_appeal); }
  set appeal(value) { this.w_appeal.set(value); }

  constructor(timer: Observer) {
    timer.subscribe(this, "tick");
    timer.subscribe(this, "hour");
  }

  notify(event: string, data?: any) {
    if (event === "tick") {
      this.tick();
    }
    if (event === "week") {
      console.log("week end", data);
      // give weekly recap receipt
    }
  }

  tick() {
    this.drawCustomers();
  }
 
  drawCustomers() {
    if (this.appeal > 0) {
      // customer generation
      this.customerProgress += this.appeal;
      if (this.customerProgress >= 1) {
        this.waitingCustomers += Math.floor(this.customerProgress);
        this.customerProgress %= 1;
      }

      // appeal decay
      
      this.appeal = Math.min(
        this.appeal * (1 - this.appealDecay),
        0.005
      );
    }
  }

  promoteShop() {
    this.appeal += this.promotionEffectiveness;
  }

  sellCoffee() {
    if (this.coffeeCups <= 0) return;

    if (this.waitingCustomers > 0) {
      this.waitingCustomers--;
      this.coffeeCups--;
      this.money += this.coffeePrice;
    }
  }

  grindBeans() {
    if (this.beans <= 0) return;

    // if finished grinding
    if (this.grindProgress >= this.grindTime) {
      this.groundCoffee += this.coffeePerBean;
      this.grindProgress = -1;
    }

    // if not grinding yet
    else if (this.grindProgress === -1) {
      this.grindProgress = 0;
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
    this.groundCoffee--;
    this.coffeeCups++;
  }

  buyBeans() {
    // possibly make bean cost scale or change over time(?)
    this.beans += 5;
    this.money -= 5;
  }

  saveState() {
    localStorage.setItem("game", JSON.stringify(this));
  }

  loadState() {
    const state = localStorage.getItem("game");
    if (state) {
      Object.assign(this, JSON.parse(state));
    }
  }
}
