import { get, type Writable, writable } from "svelte/store";
import { MultiShop } from "./multiShop";
import { AudioManager, audioManagerRegistry } from "../systems/audioManager";
import { aud } from "../../assets/aud";
import { UIManager } from "../interface/uimanager";
import { dictProxy } from "../proxies";
import { addCoffee, addMoney } from "../analytics";
import { msPerTick } from "../systems/time";

export class Shop implements ILocalShop {
	moneyMultiplier: number = 1;
	// writable resources
	w_beans: Writable<number> = writable(50);
	w_coffeeCups: Writable<number> = writable(0); // sellable coffee
	w_waitingCustomers: Writable<number> = writable(0);
	w_money: Writable<number> = writable(0); // local shop money is unusable untill collected
	w_appeal: Writable<number> = writable(0);
	w_coffeePrice: Writable<number> = writable(7);
	w_promoterUnlocked: Writable<boolean> = writable(false);
	w_supplierUnlocked: Writable<boolean> = writable(false);
	w_multiShopUnlocked: Writable<boolean> = writable(false);
	w_autoRestockUnlocked: Writable<boolean> = writable(false);
	w_maxCoffeeCups: Writable<number> = writable(36);
	w_incomePerSecond: Writable<number> = writable(0);

	// writable getters/setters
	get beans() {
		return get(this.w_beans);
	}
	set beans(value) {
		this.w_beans.set(value);
	}
	get coffeeCups() {
		return get(this.w_coffeeCups);
	}
	set coffeeCups(value) {
		this.w_coffeeCups.set(value);
		this.uiManager.setCoffeeCount(value);
	}
	get waitingCustomers() {
		return get(this.w_waitingCustomers);
	}
	set waitingCustomers(value) {
		this.w_waitingCustomers.set(value);
		this.uiManager.setCustomerCount(value);
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
	get maxCoffeeCups() {
		return get(this.w_maxCoffeeCups);
	}
	set maxCoffeeCups(value) {
		this.w_maxCoffeeCups.set(value);
	}
	get lifetimeStats() {
		return this.multiShop.lifetimeStats;
	}
	set lifetimeStats(value: { [key: string]: number }) {
		this.multiShop.lifetimeStats = value;
	}
	get incomePerSecond() {
		return get(this.w_incomePerSecond);
	}
	set incomePerSecond(value) {
		this.w_incomePerSecond.set(value);
	}

	// variable containers ///////////////////////////////////////////////////////
	w_restockSheet: Writable<{ [key: string]: number }> = writable({
		beans: 5,
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
		baristaCurrent: 2,
		serverCurrent: 1,
		promoterCurrent: 0,
		supplierCurrent: 0,
	});

	// stats /////////////////////////////////////////////////////////////////////
	beansPrice: number = 1.5;
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
	audioManager: AudioManager;
	uiManager: UIManager;
	boilTimer: number = 0;
	isSelected: boolean = false;
	lastSecondMoney: number = 0;
	incomeRateCounter: number = 1;
	incomeRateBufferCounter: number = 0;
	incomeRateBufferDelay: number = 3;
	incomeRateBuffer: Array<number> = [];

	constructor(multiShop: MultiShop, audioManager: AudioManager) {
		console.log("local shop constructor");
		this.multiShop = multiShop;
		this.audioManager = audioManager;

		// setting up default roles
		this.roles.set("barista", {
			name: "Barista",
			wage: 50,
			update: (shop: Shop) => {
				let barista = shop.roles.get("barista")!;
				if (shop.beans >= 1) {
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
				...Array.from(
					{ length: 2 },
					(_, row) => Array.from({ length: 12 }, (_, col) => [row + 6, col]),
				).flat(),
				...Array.from(
					{ length: 6 },
					(_, row) => Array.from({ length: 2 }, (_, col) => [row, col + 10]),
				).flat(),
			],
		);
		this.uiManager.setAlienTypes(["catorbiter"]);
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
			audioUpdate(this);
		}

		// progress updaters
		progressUpdates(this);

		// income rate updates
		this.incomeRateCounter = (this.incomeRateCounter + 1) % (1000 / msPerTick);
		if (this.incomeRateCounter === 0) {
			// update income buffer
			this.incomeRateBuffer.push(this.lastSecondMoney);
			this.lastSecondMoney = 0;
			// ^ IF THERE IS A SEVERE MEMORY ISSSUE IT IS LIKELY HERE.
			if (this.incomeRateBufferCounter >= this.incomeRateBufferDelay) {
				this.incomeRateBuffer.shift();
			} else {
				this.incomeRateBufferCounter += 1;
			}

			// updating average income per second
			let incomeSum = this.incomeRateBuffer.reduce((a, b) => a + b, 0);
			this.incomePerSecond = incomeSum / this.incomeRateBufferCounter;
			console.log(`Income per second: ${this.incomePerSecond}`);
			console.log(
				`Income rate buffer: ${this.incomeRateBuffer}, Counter: ${this.incomeRateBufferCounter}`,
			);
		}

		function audioUpdate(shop: Shop) {
			if (shop.boilTimer > 0) {
				shop.boilTimer -= 1;
			}
		}

		function progressUpdates(shop: Shop) {
			if (shop.progressTrackers["coffeeProgress"] >= 1) {
				let amount = Math.floor(shop.progressTrackers["coffeeProgress"]);
				if (shop.produceCoffee(amount, false)) {
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
				if (shop.sellCoffee(amount, false)) {
					shop.progressTrackers["serviceProgress"] -= amount;
				}
			}
			if (shop.progressTrackers["promotionProgress"] >= 1) {
				let amount = Math.floor(shop.progressTrackers["promotionProgress"]);
				for (let i = 0; i < amount; i++) shop.promote(false);
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

	getRestockPrice() {
		return (
			this.restockSheet["beans"] * this.beansPrice
		);
	}

	restock(playSound: boolean = true) {
		if (
			this.restockSheet["beans"] * this.beansPrice >
			(this.money + this.multiShop.money)
		) return;
		this.applyCost(this.restockSheet["beans"] * this.beansPrice);

		this.beans += this.restockSheet["beans"];
		this.lifetimeStats["totalRestocked"] += this.restockSheet["beans"];
		if (playSound) this.audioManager.playAudio("ding");
	}

	deselectShop() {
		console.log("deselecting shop");
		this.multiShop.deselectShop();
		this.multiShop.finishedFirstShop = true;
	}

	// player actions ////////////////////////////////////////////////////////////
	produceCoffee(amount: number = 1, playSound: boolean = true) {
		if (this.boilTimer === 0) {
			this.boilTimer += 7;
		}

		let numToMake = Math.floor(
			Math.min(amount, this.beans, this.maxCoffeeCups - this.coffeeCups),
		);
		if (this.beans >= numToMake) {
			if (playSound) this.audioManager.playAudio("crunch");
			this.beans -= numToMake;
			this.coffeeCups += numToMake;
			this.lifetimeStats["coffeeMade"] += numToMake;
			return true;
		}
		return false;
	}

	sellCoffee(amount: number = 1, playSound: Boolean = true) {
		if (this.isSelected) this.audioManager.playAudio("ding");
		// if (this.isSelected) {

		// }
		let numToSell = Math.floor(
			Math.min(amount, this.waitingCustomers, this.coffeeCups),
		);
		if (this.waitingCustomers >= numToSell && this.coffeeCups >= numToSell) {
			this.coffeeCups -= numToSell;
			this.waitingCustomers -= numToSell;
			this.money += this.coffeePrice * numToSell * this.moneyMultiplier;
			this.lastSecondMoney += this.coffeePrice * numToSell *
				this.moneyMultiplier;
			this.lifetimeStats["moneyMade"] += this.coffeePrice * numToSell *
				this.moneyMultiplier;
			this.lifetimeStats["coffeeSold"] += numToSell;

			//ANALYTICS
			addCoffee(numToSell);
			addMoney(this.coffeePrice * numToSell * this.moneyMultiplier);
			return true;
		}
		return false;
	}

	promote(playSound: boolean = true) {
		if (this.isSelected) this.audioManager.playAudio("papers");
		this.appeal += this.promotionEffectiveness *
			(1 - this.appeal / this.maxAppeal);
		this.appeal = Math.min(this.appeal, this.maxAppeal);
	}

	choresForBeans() {
		this.audioManager.playAudio("ding");
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
			coffeeCups: this.coffeeCups,
			waitingCustomers: this.waitingCustomers,
			minAppeal: this.minAppeal,
			maxAppeal: this.maxAppeal,
			promotionEffectiveness: this.promotionEffectiveness,
			appealDecay: this.appealDecay,
			upgrades: {},
			multiShopUnlocked: this.multiShopUnlocked,
			promoterUnlocked: this.promoterUnlocked,
			workerStats: this.workerStats,
			workerAmounts: {},
			appeal: this.appeal,
			autoRestockUnlocked: this.autoRestockUnlocked,
			restockSheet: {},
			maxCoffeeCups: this.maxCoffeeCups,
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

		for (let key in this.workerAmounts) {
			saveObj.workerAmounts[key] = this.workerAmounts[key];
		}

		return saveObj;
	}

	loadLocalState(state: LocalShopSave) {
		this.money = state.money;
		this.beans = state.beans;
		this.coffeeCups = state.coffeeCups;
		this.minAppeal = state.minAppeal;
		this.maxAppeal = state.maxAppeal;
		this.promotionEffectiveness = state.promotionEffectiveness;
		this.appealDecay = state.appealDecay;
		this.waitingCustomers = state.waitingCustomers;
		this.upgrades = new Map(Object.entries(state.upgrades));
		this.multiShopUnlocked = state.multiShopUnlocked;
		this.promoterUnlocked = state.promoterUnlocked;
		this.workerStats = state.workerStats;
		this.appeal = state.appeal;
		this.autoRestockUnlocked = state.autoRestockUnlocked;
		this.maxCoffeeCups = state.maxCoffeeCups;

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

		if (!this.audioManager || !audioManagerRegistry.has(this.audioManager)) {
			this.audioManager = new AudioManager();
			this.audioManager.addSFX("ding", aud.ding);
			this.audioManager.addSFX("crunch", aud.crunch2);
			this.audioManager.addSFX("papers", aud.papers);
			this.audioManager.addSFX("cashRegister", aud.new_cash);
			this.audioManager.setMaxVolumeScale("cashRegister", 0.5);
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
	coffeeCups: number;
	waitingCustomers: number;
	appeal: number;
	minAppeal: number;
	maxAppeal: number;
	promotionEffectiveness: number;
	appealDecay: number;
	upgrades: { [key: string]: number };
	multiShopUnlocked: boolean;
	promoterUnlocked: boolean;
	workerStats: { [key: string]: number };
	workerAmounts: { [key: string]: number };
	restockSheet: { [key: string]: number };
	autoRestockUnlocked: boolean;
	maxCoffeeCups: number;
}
