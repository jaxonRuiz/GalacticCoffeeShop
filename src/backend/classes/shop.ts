import { MultiShop } from "./multiShop";
import { get, type Writable, writable } from "svelte/store";

export class Shop implements ILocalShop {
	// writable resources
	w_beans: Writable<number> = writable(500);
	w_emptyCups: Writable<number> = writable(500);
	w_coffeeCups: Writable<number> = writable(0); // sellable coffee
	w_waitingCustomers: Writable<number> = writable(0);
	w_money: Writable<number> = writable(0); // local shop money is unusable untill collected
	w_appeal: Writable<number> = writable(0);
	w_coffeePrice: Writable<number> = writable(5);
	w_promoterUnlocked: Writable<boolean> = writable(false);
	w_supplierUnlocked: Writable<boolean> = writable(false);
	w_multiShopUnlocked: Writable<boolean> = writable(false);

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
	set restockSheet(value: { [key: string]: number }) {
		this.w_restockSheet.set(value);
	}
	get restockSheet() {
		return get(this.w_restockSheet);
	}
	get progressTrackers() {
		return get(this.w_progressTrackers);
	}
	set progressTrackers(value: { [key: string]: number }) {
		this.w_progressTrackers.set(value);
	}
	get coffeePrice() {
		return get(this.w_coffeePrice);
	}
	set coffeePrice(value) {
		this.w_coffeePrice.set(value);
	}
	get promoterUnlocked() {
		return get(this.w_promoterUnlocked);
	}
	set promoterUnlocked(value) {
		this.w_promoterUnlocked.set(value);
	}
	get supplierUnlocked() {
		return get(this.w_supplierUnlocked);
	}
	set supplierUnlocked(value) {
		this.w_supplierUnlocked.set(value);
	}
	get multiShopUnlocked() {
		return get(this.w_multiShopUnlocked);
	}
	set multiShopUnlocked(value) {
		this.w_multiShopUnlocked.set(value);
	}

	// variable containers ///////////////////////////////////////////////////////
	w_restockSheet: Writable<{ [key: string]: number }> = writable({
		beans: 5,
		emptyCups: 5,
	});
	workerStats: { [key: string]: number } = {
		baristaBaseProductivity: 0.1,
		serverBaseProductivity: 0.05,
		baristaCumulativeProductivity: 1,
		serverCumulativeProductivity: 1,
		baristaFlatProductivity: 0,
		serverFlatProductivity: 0,
	};
	w_progressTrackers: Writable<{ [key: string]: number }> = writable({
		serviceProgress: 0,
		coffeeProgress: 0,
		promotionProgress: 0,
		customerProgress: 0,
	});

	// stats /////////////////////////////////////////////////////////////////////
	beansPrice: number = 1;
	cupsPrice: number = 1;
	totalWorkers: number = 0;
	maxCustomers: number = 7;
	promotionEffectiveness: number = 0.2;
	minAppeal: number = 0.1;
	maxAppeal: number = 2;
	appealDecay: number = 0.05;
	runTutorial: boolean = true;

	// misc //////////////////////////////////////////////////////////////////////
	roles: Map<string, Role> = new Map();
	upgrades: Map<string, number> = new Map();
	multiShop: MultiShop;
	audio: Map<string, HTMLAudioElement> = new Map();
	boilTimer: number = 0;
	playBoiler: boolean = false;

	constructor(multiShop: MultiShop) {
		this.multiShop = multiShop;
		// setting up default roles
		this.roles.set("barista", {
			name: "Barista",
			numWorkers: 0,
			maxWorkers: 2,
			wage: 50,
			update: (shop: Shop) => {
				let barista = shop.roles.get("barista")!;
				if (shop.beans >= 1 && shop.emptyCups >= 1) {
					shop.progressTrackers["coffeeProgress"] +=
						((shop.workerStats["baristaBaseProductivity"] *
							shop.workerStats["baristaCumulativeProductivity"]) +
							shop.workerStats["baristaFlatProductivity"]) * barista.numWorkers;
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
						((shop.workerStats["serverBaseProductivity"] *
							shop.workerStats["serverCumulativeProductivity"]) +
							shop.workerStats["serverFlatProductivity"]) * server.numWorkers;
				}
			},
		});

		this.audio.set(
			"bgm",
			new Audio("src/assets/music/Duraznito - Quincas Moreira.mp3"),
		);
		this.audio.get("bgm")!.loop = true;
		this.audio.get("bgm")!.volume = 0.3;
		this.audio.get("bgm")!.play();
		this.audio.set("boiling", new Audio("src/assets/sfx/boiling.flac"));
		this.audio.get("boiling")!.loop = true;
		this.audio.set("crowd", new Audio("src/assets/sfx/crowd.mp3"));
		this.audio.get("crowd")!.loop = true;
		this.audio.get("crowd")!.volume = 0;
		this.audio.get("crowd")!.play();
	}

	// multishop utility /////////////////////////////////////////////////////////
	tickCounter: number = 0;
	tick(owner: MultiShop) {
		this.tickCounter += 1;
		if (this.tickCounter >= Number.MAX_SAFE_INTEGER) this.tickCounter = 1;
		this.roles.forEach((role: Role) => {
			role.update(this, this.tickCounter);
		});

		this.decayAppeal();
		this.drawCustomers();

		// boil audio effect
		if (this.boilTimer > 0) {
			this.boilTimer -= 1;
		} else {
			this.playBoiler = false;
			this.audio.get("boiling")!.pause();
		}

		// crowd noise
		this.audio.get("crowd")!.volume = Math.min(
			this.waitingCustomers / this.maxCustomers,
			1,
		);

		// progress updaters
		// may limit throughput to 1 thing per tick, maybe fix
		if (this.progressTrackers["coffeeProgress"] >= 1) {
			let amount = Math.floor(this.progressTrackers["coffeeProgress"]);
			if (this.produceCoffee(amount)) {
				this.progressTrackers["coffeeProgress"] -= amount;
			}
		}
		if (
			this.progressTrackers["customerProgress"] >= 1 &&
			this.waitingCustomers < this.maxCustomers
		) {
			let amount = Math.floor(this.progressTrackers["customerProgress"]);
			this.waitingCustomers += amount;
			this.progressTrackers["customerProgress"] -= amount;
		}
		if (this.progressTrackers["serviceProgress"] >= 1) {
			let amount = Math.floor(this.progressTrackers["serviceProgress"]);
			if (this.sellCoffee(amount)) {
				this.progressTrackers["serviceProgress"] -= amount;
			}
		}
		if (this.progressTrackers["promotionProgress"] >= 1) {
			let amount = Math.floor(this.progressTrackers["promotionProgress"]);
			for (let i = 0; i < amount; i++) this.promote();
			this.progressTrackers["promotionProgress"] -= amount;
		}
	}

	// TODO make cleanness affect appeal decay
	decayAppeal() {
		// appeal decay
		if (this.appeal > this.minAppeal) {
			this.appeal = this.appeal * (1 - this.appealDecay);
		} else {
			this.appeal = this.minAppeal;
		}
	}

	drawCustomers() {
		if (this.appeal > 0) {
			// customer generation
			this.progressTrackers["customerProgress"] += this.appeal;
			if (this.progressTrackers["customerProgress"] >= 1) {
				this.waitingCustomers += Math.floor(
					this.progressTrackers["customerProgress"],
				);
				this.waitingCustomers = Math.min(
					this.waitingCustomers,
					this.maxCustomers,
				);
				this.progressTrackers["customerProgress"] %= 1;
			}
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

	restock() {
		// !!! money is taken by getExpenses instead.
		this.applyCost(this.restockSheet["beans"] * this.beansPrice);
		this.applyCost(this.restockSheet["emptyCups"] * this.cupsPrice);

		this.beans += this.restockSheet["beans"];
		this.emptyCups += this.restockSheet["emptyCups"];

		let audio = new Audio("src/assets/sfx/cashRegister.wav");
		audio.volume = 0.7;
		audio.play();
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

	deselectShop() {
		console.log("deselecting shop");
		this.multiShop.deselectShop();
		this.multiShop.finishedFirstShop = true;
	}

	// player actions ////////////////////////////////////////////////////////////
	produceCoffee(amount: number = 1) {
		if (this.boilTimer === 0) {
			this.playBoiler = true;
			this.audio.get("boiling")!.play();
			this.boilTimer += 7;
		}

		let numToMake = Math.floor(Math.min(amount, this.beans, this.emptyCups));
		if (this.beans >= numToMake && this.emptyCups >= numToMake) {
			this.beans -= numToMake;
			this.emptyCups -= numToMake;
			this.coffeeCups += numToMake;
			return true;
		}
		return false;
	}

	sellCoffee(amount: number = 1) {
		let audio = new Audio("src/assets/sfx/ding.wav");
		audio.volume = 0.4;
		audio.play();
		let numToSell = Math.floor(
			Math.min(amount, this.waitingCustomers, this.coffeeCups),
		);
		if (this.waitingCustomers >= numToSell && this.coffeeCups >= numToSell) {
			this.coffeeCups -= numToSell;
			this.waitingCustomers -= numToSell;
			this.money += this.coffeePrice * numToSell;
			return true;
		}
		return false;
	}

	promote() {
		let audio = new Audio("src/assets/sfx/papers.wav");
		audio.play();
		this.appeal += this.promotionEffectiveness *
			(1 - this.appeal / this.maxAppeal);
		this.appeal = Math.min(this.appeal, this.maxAppeal);
	}

	addWorker(role: string) {
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

	// upgrade functions /////////////////////////////////////////////////////////

	// TODO frame to unlock new jobs
	unlockPromoter() {
		this.roles.set("promoter", {
			name: "Promoter",
			numWorkers: 0,
			maxWorkers: 1,
			wage: 100,
			update: (shop: Shop) => {
				shop.progressTrackers["promotionProgress"] += 0.03;
			},
		});
		this.w_promoterUnlocked.set(true);
	}

	unlockSupplier() {
		this.roles.set("supplier", {
			name: "Supplier",
			numWorkers: 0,
			maxWorkers: 1,
			wage: 100,
			update: (shop: Shop, tickCounter: number) => {
				console.log("supplier updated");
			},
		});
		this.w_supplierUnlocked.set(true);
	}

	getSaveState(): LocalShopSave {
		let saveObj: LocalShopSave = {
			money: this.money,
			beans: this.beans,
			emptyCups: this.emptyCups,
			coffeeCups: this.coffeeCups,
			waitingCustomers: this.waitingCustomers,
			upgrades: {},
			multiShopUnlocked: this.multiShopUnlocked,
			promoterUnlocked: this.promoterUnlocked,
		};

		for (let [key, value] of this.upgrades) {
			saveObj.upgrades[key] = value;
		}

		return saveObj;
	}

	loadLocalState(state: LocalShopSave) {
		this.money = state.money;
		this.beans = state.beans;
		this.emptyCups = state.emptyCups;
		this.coffeeCups = state.coffeeCups;
		this.waitingCustomers = state.waitingCustomers;
		this.upgrades = new Map(Object.entries(state.upgrades));
		this.multiShopUnlocked = state.multiShopUnlocked;
		this.promoterUnlocked = state.promoterUnlocked;
	}
}

interface Role {
	name: string;
	numWorkers: number;
	maxWorkers: number;
	wage: number; // weekly
	update: (shop: Shop, tickCounter: number) => void;
}

export interface LocalShopSave {
	money: number;
	beans: number;
	emptyCups: number;
	coffeeCups: number;
	waitingCustomers: number;
	upgrades: { [key: string]: number };
	multiShopUnlocked: boolean;
	promoterUnlocked: boolean;
}
