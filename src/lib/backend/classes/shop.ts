import { get, type Writable, writable } from "svelte/store";
import { MultiShop } from "./multiShop";
import { cleanupAudioManagers, AudioManager } from "../systems/audioManager";
import { aud } from "../../assets/aud";
import { UIManager } from "../interface/uimanager";
import { dictProxy } from "../proxies";

export class Shop implements ILocalShop {
	moneyMultiplier: number = 1;
	// writable resources
	w_beans: Writable<number> = writable(10);
	w_emptyCups: Writable<number> = writable(50);
	w_coffeeCups: Writable<number> = writable(0); // sellable coffee
	w_waitingCustomers: Writable<number> = writable(0);
	w_money: Writable<number> = writable(0); // local shop money is unusable untill collected
	w_appeal: Writable<number> = writable(0);
	w_coffeePrice: Writable<number> = writable(5);
	w_promoterUnlocked: Writable<boolean> = writable(false);
	w_supplierUnlocked: Writable<boolean> = writable(false);
	w_multiShopUnlocked: Writable<boolean> = writable(false);
	w_autoRestockUnlocked: Writable<boolean> = writable(false);


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
	get restockSheet() {
		return dictProxy(this.w_restockSheet);
	}
	set restockSheet(value: { [key: string]: number }) {
		this.w_restockSheet.set(value);
	}
	get progressTrackers() {
		return dictProxy(this.w_progressTrackers);
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
	get workerAmounts() {
		return dictProxy(this.w_workerAmounts);
	}
	set workerAmounts(value: { [key: string]: number }) {
		this.w_workerAmounts.set(value);
	}
	get autoRestockUnlocked() {
		return get(this.w_autoRestockUnlocked);
	}
	set autoRestockUnlocked(value) {
		this.w_autoRestockUnlocked.set(value);
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
	w_workerAmounts: Writable<{ [key: string]: number }> = writable({
		baristaCurrent: 0,
		serverCurrent: 0,
		promoterCurrent: 0,
		supplierCurrent: 0,
		baristaMax: 2,
		serverMax: 1,
		promoterMax: 1,
		supplierMax: 1,
	});

	lifetimeStats: { [key: string]: number } = {
		coffeeSold: 0,
		moneyMade: 0,
		coffeeMade: 0,
		totalRestocked: 0,
	};

	// stats /////////////////////////////////////////////////////////////////////
	beansPrice: number = 2.5;
	cupsPrice: number = 0.1;
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
	audioManager: AudioManager = new AudioManager();
	uiManager: UIManager;
	boilTimer: number = 0;
	playBoiler: boolean = false;
	isSelected: boolean = false;

	constructor(multiShop: MultiShop, audioManager: AudioManager) {
		this.multiShop = multiShop;
		this.audioManager = audioManager;

		// Setting up audio
		this.audioManager.addSFX("boiling", aud.boiling);
		this.audioManager.addSFX("ding", aud.ding);
		this.audioManager.addAmbience("crowd", aud.new_crowd);

		this.audioManager.playAudio("crowd");

		// setting up default roles
		this.roles.set("barista", {
			name: "Barista",
			wage: 50,
			update: (shop: Shop) => {
				let barista = shop.roles.get("barista")!;
				if (shop.beans >= 1 && shop.emptyCups >= 1) {
					shop.progressTrackers["coffeeProgress"] +=
						(shop.workerStats["baristaBaseProductivity"] *
							shop.workerStats["baristaCumulativeProductivity"] +
							shop.workerStats["baristaFlatProductivity"]) *
						this.workerAmounts["baristaCurrent"];
				}
			},
		});

		this.roles.set("server", {
			name: "Server",
			wage: 50,
			update: (shop: Shop) => {
				let server = shop.roles.get("server")!;
				if (shop.waitingCustomers > 0 && shop.coffeeCups > 0) {
					shop.progressTrackers["serviceProgress"] +=
						(shop.workerStats["serverBaseProductivity"] *
							shop.workerStats["serverCumulativeProductivity"] +
							shop.workerStats["serverFlatProductivity"]) *
						this.workerAmounts["serverCurrent"];
				}
			},
		});

		this.uiManager = new UIManager();
		this.uiManager.setCoffeeLocations(
			[
				...Array.from({ length: 2 }, (_, row) =>
					Array.from({ length: 12 }, (_, col) => [row + 6, col])
				).flat(),
				...Array.from({ length: 6 }, (_, row) =>
					Array.from({ length: 2 }, (_, col) => [row, col + 10])
				).flat(),
			]);
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

		// only play audio if selected
		if (this.isSelected) {
			// this.audioManager.enableAudio();
			audioUpdate(this);
		} else {
			// this.audioManager.disableAudio();
		}

		// progress updaters
		progressUpdates(this);

		function audioUpdate(shop: Shop) {
			if (shop.boilTimer > 0) {
				shop.boilTimer -= 1;
			} else {
				shop.playBoiler = false;
			}
		}

		function progressUpdates(shop: Shop) {
			if (shop.progressTrackers["coffeeProgress"] >= 1) {
				let amount = Math.floor(shop.progressTrackers["coffeeProgress"]);
				if (shop.produceCoffee(amount)) {
					shop.progressTrackers["coffeeProgress"] -= amount;
				}
			}
			if (
				shop.progressTrackers["customerProgress"] >= 1 &&
				shop.waitingCustomers < shop.maxCustomers
			) {
				let amount = Math.floor(shop.progressTrackers["customerProgress"]);
				shop.waitingCustomers += amount;
				shop.progressTrackers["customerProgress"] -= amount;
			}
			if (shop.progressTrackers["serviceProgress"] >= 1) {
				let amount = Math.floor(shop.progressTrackers["serviceProgress"]);
				if (shop.sellCoffee(amount)) {
					shop.progressTrackers["serviceProgress"] -= amount;
				}
			}
			if (shop.progressTrackers["promotionProgress"] >= 1) {
				let amount = Math.floor(shop.progressTrackers["promotionProgress"]);
				for (let i = 0; i < amount; i++) shop.promote();
				shop.progressTrackers["promotionProgress"] -= amount;
			}
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
					this.progressTrackers["customerProgress"]
				);
				this.waitingCustomers = Math.min(
					this.waitingCustomers,
					this.maxCustomers
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

	getRestockPrice() {
		return (
			this.restockSheet["beans"] * this.beansPrice +
			this.restockSheet["emptyCups"] * this.cupsPrice
		);
	}

	restock() {
		this.applyCost(this.restockSheet["beans"] * this.beansPrice);
		this.applyCost(this.restockSheet["emptyCups"] * this.cupsPrice);

		this.beans += this.restockSheet["beans"];
		this.emptyCups += this.restockSheet["emptyCups"];
		this.lifetimeStats["totalRestocked"] += this.restockSheet["beans"] + this.restockSheet["emptyCups"];

		this.audioManager.playAudio("ding");
	}


	getTotalExpenses() {
		let totalExpenses = 0;
		this.roles.forEach((role: Role) => {
			// pain peko
			let numWorkers = this.workerAmounts[role.name.toLowerCase() + "Current"];
			totalExpenses += numWorkers * role.wage;
		});
		// restock expenses taken from restock()
		// totalExpenses += this.beans * this.beansPrice;
		// totalExpenses += this.emptyCups * this.cupsPrice;

		return totalExpenses;
	}

	deselectShop() {
		this.multiShop.deselectShop();
		this.multiShop.finishedFirstShop = true;
	}

	// player actions ////////////////////////////////////////////////////////////
	produceCoffee(amount: number = 1) {
		if (this.boilTimer === 0) {
			this.boilTimer += 7;
			this.audioManager.playAudio("boiling");
		}

		let numToMake = Math.floor(Math.min(amount, this.beans, this.emptyCups));
		if (this.beans >= numToMake && this.emptyCups >= numToMake) {
			this.beans -= numToMake;
			this.emptyCups -= numToMake;
			this.coffeeCups += numToMake;
			this.lifetimeStats["coffeeMade"] += numToMake;
			//TODO will break if amt > 1
			this.uiManager.coffeeMade(this.coffeeCups);
			return true;
		}
		return false;
	}

	sellCoffee(amount: number = 1) {
		this.audioManager.playAudio("ding");
		// if (this.isSelected) {
			
		// }
		let numToSell = Math.floor(
			Math.min(amount, this.waitingCustomers, this.coffeeCups)
		);
		if (this.waitingCustomers >= numToSell && this.coffeeCups >= numToSell) {
			this.coffeeCups -= numToSell;
			this.waitingCustomers -= numToSell;
			this.money += this.coffeePrice * numToSell * this.moneyMultiplier;
			this.lifetimeStats["moneyMade"] +=
				this.coffeePrice * numToSell * this.moneyMultiplier;
			this.lifetimeStats["coffeeSold"] += numToSell;
			// TODO will break if amt > 1
			this.uiManager.coffeeSold();
			return true;
		}
		return false;
	}

	promote() {
		this.audioManager.playAudio("ding");
		this.appeal +=
			this.promotionEffectiveness * (1 - this.appeal / this.maxAppeal);
		this.appeal = Math.min(this.appeal, this.maxAppeal);
	}

	addWorker(role: string) {
		this.audioManager.playAudio("ding");
		if (!this.roles.has(role)) throw new Error(`${role} does not exist`);
		let numWorkers = this.workerAmounts[role + "Current"];
		let maxWorkers = this.workerAmounts[role + "Max"];

		let roleObj = this.roles.get(role);
		if (numWorkers < maxWorkers) {
			this.workerAmounts[role + "Current"]++;
			// this.applyCost(roleObj!.wage*2); // hiring cost?
		}
	}

	removeWorker(role: string) {
		this.audioManager.playAudio("ding");
		if (!this.roles.has(role)) throw new Error("Role does not exist");
		let roleObj = this.roles.get(role)!;
		if (this.workerAmounts[role + "Current"] > 0) {
			this.workerAmounts[role + "Current"]--;
		}
	}

	choresForBeans() {
		this.audioManager.playAudio("ding");
		this.emptyCups += 1;
		this.beans += 1;
	}

	// upgrade functions /////////////////////////////////////////////////////////

	unlockPromoter() {
		console.log("local shop promoter unlocked");
		this.promoterUnlocked = true;
		this.roles.set("promoter", {
			name: "Promoter",
			wage: 100,
			update: (shop: Shop) => {
				shop.progressTrackers["promotionProgress"] += 0.03;
			},
		});
		this.w_promoterUnlocked.set(true);
	}

	unlockAutoRestock() {
		this.autoRestockUnlocked = true;
	}

	unlockSupplier() {
		this.supplierUnlocked = true;
		this.roles.set("supplier", {
			name: "Supplier",
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
			minAppeal: this.minAppeal,
			maxAppeal: this.maxAppeal,
			promotionEffectiveness: this.promotionEffectiveness,
			appealDecay: this.appealDecay,
			upgrades: {},
			multiShopUnlocked: this.multiShopUnlocked,
			promoterUnlocked: this.promoterUnlocked,
			lifetimeStats: this.lifetimeStats,
			workerStats: this.workerStats,
			workerAmounts: {},
			appeal: this.appeal,
			autoRestockUnlocked: this.autoRestockUnlocked,
			restockSheet: {},
		};
		for (let key in this.restockSheet) {
			saveObj.restockSheet[key] = this.restockSheet[key];
		}
		for (let [key, value] of this.upgrades) {
			saveObj.upgrades[key] = value;
		}

		for (let key in this.workerStats) {
			saveObj.workerStats[key] = this.workerStats[key];
		}

		return saveObj;
	}


	loadLocalState(state: LocalShopSave) {
		this.money = state.money;
		this.beans = state.beans;
		this.emptyCups = state.emptyCups;
		this.coffeeCups = state.coffeeCups;
		this.minAppeal = state.minAppeal;
		this.maxAppeal = state.maxAppeal;
		this.promotionEffectiveness = state.promotionEffectiveness;
		this.appealDecay = state.appealDecay;
		this.waitingCustomers = state.waitingCustomers;
		this.upgrades = new Map(Object.entries(state.upgrades));
		this.multiShopUnlocked = state.multiShopUnlocked;
		this.promoterUnlocked = state.promoterUnlocked;
		this.lifetimeStats = state.lifetimeStats;
		this.workerStats = state.workerStats;
		this.appeal = state.appeal;
		this.autoRestockUnlocked = state.autoRestockUnlocked;

		let restockSheetValue = get(this.w_restockSheet);
		for (let key in state.restockSheet) {
			if (restockSheetValue.hasOwnProperty(key)) {
				restockSheetValue[key] = state.restockSheet[key];
			}
		}
		this.w_restockSheet.set(restockSheetValue);

		if (this.promoterUnlocked) {
			this.unlockPromoter();
		}
		for (let key in state.workerAmounts) {
			this.workerAmounts[key] = state.workerAmounts[key];
		}
		for (let key in state.workerStats) {
			this.workerStats[key] = state.workerStats[key];
		}
	}
}

interface Role {
	name: string;
	wage: number; // weekly
	update: (shop: Shop, tickCounter: number) => void;
}

export interface LocalShopSave {
	money: number;
	beans: number;
	emptyCups: number;
	coffeeCups: number;
	waitingCustomers: number;
	appeal: number;
	minAppeal: number;
	maxAppeal: number;
	promotionEffectiveness: number;
	appealDecay: number;
	upgrades: { [key: string]: number };
	lifetimeStats: { [key: string]: number };
	multiShopUnlocked: boolean;
	promoterUnlocked: boolean;
	workerStats: { [key: string]: number };
	workerAmounts: { [key: string]: number };
	restockSheet: { [key: string]: number };
	autoRestockUnlocked: boolean;
}
