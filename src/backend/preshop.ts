export class Preshop {
  // resources
  money: number = 0;
  beans: number = 5;
  coffee: number = 0;
  waitingCustomers: number = 0;

  // stats
  coffeePrice: number = 3;
  coffeePerBean: number = 5;
  grindTime: number = 5; // number of times to click to grind a bean
  grindProgress: number = -1; // -1 means not grinding yet
  appeal: number = 0; // sets customerDraw 
  customerProgress: number = 0; // progress to next customer
  customerDraw: number = 0; // rate of drawing customers
  appealDecay: number = 0.05 // rate of decay of customer appeal


  constructor() {

  }

  tick() {
    this.drawCustomers();
  }

  drawCustomers() {
    if (this.customerDraw > 0) {
      // customer generation
      this.customerProgress += this.customerDraw;
      if (this.customerProgress >= 1) {
        this.waitingCustomers += Math.floor(this.customerProgress);
        this.customerProgress %= 1;
      }

      // appeal decay
      this.customerDraw = Math.min(this.customerDraw * (1 - this.appealDecay), 0.0001);
    }
  }

  promoteShop() {
    this.customerDraw += this.appeal;
  }

  sellCoffee() {
    if (this.coffee <= 0) return;

    if (this.waitingCustomers > 0) {
      this.waitingCustomers--;
      this.coffee--;
      this.money += this.coffeePrice;
    }
  }

  grindCoffee() {
    if (this.beans <= 0) return;

    // if finished grinding
    if (this.grindProgress >= this.grindTime) {
      this.coffee += this.coffeePerBean;
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

  buyBeans() {
    // possibly make bean cost scale or change over time(?)
    this.beans += 5;
    this.money -= 5;
  }
}