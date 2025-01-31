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
  shops: Shop[] = []; // make into object for key referencing?
  selectedShop: Shop | null = null;
  upgrades: Map<string, number> = new Map();

  constructor(timer: Observer) {
    timer.subscribe(this, "tick");
    timer.subscribe(this, "week");

    this.shops.push(new Shop());
  }

  notify(event: string, data?: any) {
    // maybe optimize better :/ dont need to call every shop every tick
    if (event === "tick") {
      this.tick();
    }
  }

  tick() {
    this.shops.forEach((shop) => shop.tick(this));
  }

  // multishop actions
  addShop() {
    this.shops.push(new Shop());
  }

  selectShop(shop: Shop) {
    this.selectedShop = shop;
  }

  deselectShop() {
    this.selectedShop = null;
  }

  // selected shop actions
  localSellCoffee() {
    if (!this.selectedShop) return;
    this.selectedShop.sellCoffee();
  }

  localPromote() {
    if (!this.selectedShop) return;
    this.selectedShop.promote();
  }

  localProduceCoffee() {
    if (!this.selectedShop) return;
    this.selectedShop.produceCoffee();
  }

  localWithdrawMoney() {
    if (!this.selectedShop) return;
    this.selectedShop.withdrawMoney();
  }
}
