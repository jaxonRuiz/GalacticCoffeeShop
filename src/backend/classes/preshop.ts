import { Publisher } from "../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { msPerTick } from "../systems/time";

const PLAYTEST_MULTIPLIER = 3;

export class Preshop implements ISubscriber, IScene {
	// resources (setting writable to interact with svelte)
	// not to be used in backend
	w_money: Writable<number> = writable(20);
	w_beans: Writable<number> = writable(20);
	w_groundCoffee: Writable<number> = writable(0);
	w_coffeeCups: Writable<number> = writable(0);
	w_waitingCustomers: Writable<number> = writable(0);
	w_appeal: Writable<number> = writable(0);
	w_beanPrice: Writable<number> = writable(5.99);
	w_grindProgress: Writable<number> = writable(-1); // -1 means not grinding
	w_canMakeCoffee: Writable<boolean> = writable(true);
	w_makeCoffeeTime: Writable<number> = writable(0);
	w_makeCoffeeCount: Writable<number> = writable(0);

	// internal stats
	coffeePrice: number = 3.5;
	beansPerBuy: number = 3; // how many beans are bought at a time
	coffeePerBean: number = 2.5;
	grindQuantity: number = 1; // how many beans are ground at a time
	grindTime: number = 5; // number of times to click to grind a bean
	customerProgress: number = 0; // progress to next customer
	promotionEffectiveness: number = 0.1; // current rate of customer generation
	appealDecay: number = 0.05; // rate of decay of customer appeal
	maxCustomers: number = 5;
	maxAppeal: number = 0.7;
	minAppeal: number = 0; // minimum appeal (after decay)
	makeCoffeeQuantity: number = 3; // how many cups of coffee are made per run
	makeCoffeeCooldown: number = 2000; // cooldown for making coffee IN MILLISECONDS
	makeCoffeeBatches: number = 1; // how many cups of coffee are made per run

	autogrindingEnabled: boolean = false; // whether or not to grind automatically
	autogrindInterval: number = 10;
	autogrindCounter: number = 0;

	autosellEnabled: boolean = false; // whether or not to sell automatically
	autosellInterval: number = 15;
	autosellCounter: number = 0;

	// stat counters
	w_lifetimeGrindBeans: Writable<number> = writable(0);
	w_lifetimeCoffeeSold: Writable<number> = writable(0);
	w_lifetimeCoffeeMade: Writable<number> = writable(0);


	// contains list of upgrades (IDs) and their levels
	upgrades: Map<string, number> = new Map();

	sceneManager: Publisher;

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
	get canMakeCoffee() {
		return get(this.w_canMakeCoffee);
	}
	set canMakeCoffee(value) {
		this.w_canMakeCoffee.set(value);
	}
	get makeCoffeeTime() {
		return get(this.w_makeCoffeeTime);
	}
	set makeCoffeeTime(value) {
		this.w_makeCoffeeTime.set(value);
	}
	get makeCoffeeCount() {
		return get(this.w_makeCoffeeCount);
	}
	set makeCoffeeCount(value) {
		this.w_makeCoffeeCount.set(value);
	}
	// stat counters
	get lifetimeGrindBeans() {
		return get(this.w_lifetimeGrindBeans);
	}
	set lifetimeGrindBeans(value) {
		this.w_lifetimeGrindBeans.set(value);
	}
	get lifetimeCoffeeSold() {
		return get(this.w_lifetimeCoffeeSold);
	}
	set lifetimeCoffeeSold(value) {
		this.w_lifetimeCoffeeSold.set(value);
	}
	get lifetimeCoffeeMade() {
		return get(this.w_lifetimeCoffeeMade);
	}
	set lifetimeCoffeeMade(value) {
		this.w_lifetimeCoffeeMade.set(value);
	}

	constructor(timer: Publisher, sceneManager: Publisher) {
		timer.subscribe(this, "tick");
		timer.subscribe(this, "hour");
		timer.subscribe(this, "week");
		this.sceneManager = sceneManager;
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
		if (!this.canMakeCoffee) {
			this.makeCoffeeTimedown();
		}
		if (this.autogrindingEnabled) {
			this.autogrindCounter++;
			if (this.autogrindCounter >= this.autogrindInterval) {
				this.grindBeans();
				this.autogrindCounter = 0;
			}
		}
		if (this.autosellEnabled) {
			this.autosellCounter++;
			if (this.autosellCounter >= this.autosellInterval) {
				this.sellCoffee();
				this.autosellCounter = 0;
			}
		}

	}

	drawCustomers() {
		if (this.appeal > 0) {
			// customer generation
			this.customerProgress += this.appeal;
			if (this.customerProgress >= 1) {
				this.waitingCustomers += Math.floor(this.customerProgress);
				this.waitingCustomers = Math.min(
					this.waitingCustomers,
					this.maxCustomers,
				);
				this.customerProgress %= 1;
			}
		}
	}

	decayAppeal() {
		// appeal decay
		if (this.appeal > this.minAppeal) {
			this.appeal = this.appeal * (1 - this.appealDecay);
		} else {
			this.appeal = this.minAppeal;
		}
	}

	makeCoffeeTimedown() {
		this.makeCoffeeTime += msPerTick;
		if (this.makeCoffeeTime > this.makeCoffeeCooldown) {
			this.makeCoffeeCount -= 1;
			this.lifetimeCoffeeMade += this.coffeeToMake;
			this.coffeeCups += this.coffeeToMake;
			this.makeCoffeeTime = 0;


			if (this.makeCoffeeCount == 0 || this.groundCoffee < 1) {
				console.log("finished making coffee");
				this.makeCoffeeTime = 0;
				this.makeCoffeeCount = 0;
				this.canMakeCoffee = true;
			} else {
				console.log("starting new coffee");
				this.makeCoffee();
			}
		}
	}

	// TODO make appeal diminishing effectiveness
	promoteShop() {
		this.appeal += this.promotionEffectiveness *
			(1 - ((this.minAppeal + this.appeal) / (this.minAppeal + this.maxAppeal)));
		this.appeal = Math.min(this.appeal, this.maxAppeal);
	}

	sellCoffee() {
		if (this.coffeeCups < 1) return;

		if (this.waitingCustomers >= 1) {
			this.waitingCustomers--;
			this.coffeeCups--;
			this.money += this.coffeePrice * PLAYTEST_MULTIPLIER;
			this.lifetimeCoffeeSold++;
		}
	}

	beansToGrind: number = 0;
	grindBeans() {
		if (this.beans <= 0 && this.grindProgress == -1) return;

		// if not grinding yet
		if (this.grindProgress === -1) {
			this.grindProgress = 1;
			this.beansToGrind = Math.min(this.grindQuantity, this.beans);
			this.beans -= this.beansToGrind;
			if (this.beans < 0) this.beans = 0;
		} // if grinding
		else {
			this.grindProgress++;
		}

		// if finished grinding
		if (this.grindProgress > this.grindTime) {
			this.groundCoffee += this.coffeePerBean * this.beansToGrind;
			this.grindProgress = -1;
			this.lifetimeGrindBeans++;
		}
	}

	coffeeToMake: number = 0;
	makeCoffee() {
		if (this.groundCoffee < 1) return;
		// if (!this.canMakeCoffee) return;

		// start coffee batch
		if (this.canMakeCoffee) {
			console.log("new coffee batch");
			this.canMakeCoffee = false;
			this.makeCoffeeCount = this.makeCoffeeBatches;
		}

		console.log("making coffee", this.coffeeToMake);
		// possibly add cooldown or timer effect
		this.coffeeToMake = Math.min(this.groundCoffee, this.makeCoffeeQuantity);
		this.groundCoffee -= this.coffeeToMake;
		this.makeCoffeeTime = 0;
	}

	buyBeans() {
		// possibly make bean cost scale or change over time(?)
		if (this.money < this.beanPrice) return;
		this.beans += this.beansPerBuy;
		this.money -= this.beanPrice;
	}
	choresForBeans() {
		this.beans += 0.5;
	}

	applyCost(cost: number) {
		// if (this.money < cost) return; // flag something? DEBT
		this.money -= cost;
	}

	endScene() {
		console.log("preshop endScene()");

		this.sceneManager.emit("nextScene");
	}

	// save/load ////////////////////////////////////////////////////////////
	saveState() {
		let saveObj: PreshopSave = {
			money: this.money,
			beans: this.beans,
			groundCoffee: this.groundCoffee,
			coffeeCups: this.coffeeCups,
			waitingCustomers: this.waitingCustomers,
			appeal: this.appeal,
			beanPrice: this.beanPrice,
			grindProgress: this.grindProgress,

			coffeePrice: this.coffeePrice,
			beansPerBuy: this.beansPerBuy,
			coffeePerBean: this.coffeePerBean,
			grindTime: this.grindTime,
			promotionEffectiveness: this.promotionEffectiveness,
			maxCustomers: this.maxCustomers,
			maxAppeal: this.maxAppeal,
			coffeeQuantity: this.makeCoffeeQuantity,

			lifetimeGrindBeans: this.lifetimeGrindBeans,
			lifetimeCoffeeSold: this.lifetimeCoffeeSold,
			lifetimeCoffeeMade: this.lifetimeCoffeeMade,

			upgrades: {},
		};

		for (let [key, value] of this.upgrades) {
			saveObj.upgrades[key] = value;
		}

		localStorage.setItem("preshop", JSON.stringify(saveObj));
	}

	loadState() {
		const rawJSON = localStorage.getItem("preshop");

		if (rawJSON === null) return;

		const state: PreshopSave = JSON.parse(rawJSON);

		this.upgrades = new Map(Object.entries(state.upgrades));
		this.money = state.money;
		this.beans = state.beans;
		this.groundCoffee = state.groundCoffee;
		this.coffeeCups = state.coffeeCups;
		this.waitingCustomers = state.waitingCustomers;
		this.appeal = state.appeal;
		this.beanPrice = state.beanPrice;
		this.grindProgress = state.grindProgress;

		this.coffeePrice = state.coffeePrice;
		this.beansPerBuy = state.beansPerBuy;
		this.coffeePerBean = state.coffeePerBean;
		this.grindTime = state.grindTime;
		this.promotionEffectiveness = state.promotionEffectiveness;
		this.maxCustomers = state.maxCustomers;
		this.customerProgress = 0;
		this.maxAppeal = state.maxAppeal;
		this.makeCoffeeQuantity = state.coffeeQuantity;

		this.lifetimeGrindBeans = state.lifetimeGrindBeans;
		this.lifetimeCoffeeSold = state.lifetimeCoffeeSold;
		this.lifetimeCoffeeMade = state.lifetimeCoffeeMade;
	}

	clearState() {
		localStorage.removeItem("preshop");
	}
}

interface PreshopSave {
	money: number;
	beans: number;
	groundCoffee: number;
	coffeeCups: number;
	waitingCustomers: number;
	appeal: number;
	beanPrice: number;
	grindProgress: number;

	coffeePrice: number;
	beansPerBuy: number;
	coffeePerBean: number;
	grindTime: number;
	promotionEffectiveness: number;
	maxCustomers: number;
	maxAppeal: number;
	coffeeQuantity: number;

	lifetimeGrindBeans: number;
	lifetimeCoffeeSold: number;
	lifetimeCoffeeMade: number;

	upgrades: { [key: string]: number };
}
