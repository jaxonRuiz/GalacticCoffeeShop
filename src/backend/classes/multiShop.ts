import { Observer } from "../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { Shop } from "./shop";

export class MultiShop {
  // writable resources
  w_money: Writable<number> = writable(0);

  // writable getters/setters
  get money() {
    return get(this.w_money);
  }
  set money(value) {
    this.w_money.set(value);
  }


  // internals
  shops: Shop[] = [];
  upgrades: Map<string, number> = new Map();

  constructor(timer: Observer) {
    timer.subscribe(this, "tick");
    timer.subscribe(this, "week");

    this.shops.push(new Shop());
  }

  notify(event:string, data?: any) {
    // maybe optimize better :/ dont need to call every shop every tick
    if (event === "tick") {
      this.tick();
    }
  }

  tick() {
    this.shops.forEach(shop => shop.tick(this));
  }

  addShop() {
    this.shops.push(new Shop());
  }
}