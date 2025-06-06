import { get, type Writable, writable } from "svelte/store";
import { Publisher } from "../systems/observer";
import { type LocalShopSave, Shop } from "./shop";
import { UpgradeManager } from "../systems/upgradeManager";
import {
	AudioManager,
	audioManagerRegistry,
	cleanupAudioManagers,
} from "../systems/audioManager";
import { aud } from "../../assets/aud";
import { dictProxy } from "../proxies";

export class MultiShop implements ISubscriber, IScene, IMultiShop {
	// writable resources
	w_money: Writable<number> = writable(0);
	w_selectedShop: Writable<Shop | null> = writable(null);
	w_selectedShopIndex: Writable<number> = writable(-1);
	w_shops: Writable<Shop[]> = writable([]);
	w_finishedFirstShop: Writable<boolean> = writable(false);
	w_multiShopRestockUnlocked: Writable<boolean> = writable(false);
	w_multiShopAutoRestockUnlocked: Writable<boolean> = writable(false);
	w_multiShopAutoRestockToggled: Writable<boolean> = writable(false);
	w_restockCounter: Writable<number> = writable(0);
	w_restockInterval: Writable<number> = writable(40);

	// writable getters/setters
	get money() {
		return get(this.w_money);
	}
	set money(value) {
		this.w_money.set(value);
	}
	get selectedShop() {
		return get(this.w_selectedShop);
	}
	set selectedShop(value) {
		this.w_selectedShop.set(value);
	}
	get selectedShopIndex() {
		return get(this.w_selectedShopIndex);
	}
	set selectedShopIndex(value) {
		this.w_selectedShopIndex.set(value);
	}
	get shops() {
		return get(this.w_shops);
	}
	set shops(value) {
		this.w_shops.set(value);
	}
	get finishedFirstShop() {
		return get(this.w_finishedFirstShop);
	}
	set finishedFirstShop(value) {
		this.w_finishedFirstShop.set(value);
	}
	get lifetimeStats() {
		return dictProxy(this.w_lifetimeStats);
	}
	set lifetimeStats(value: { [key: string]: number }) {
		this.w_lifetimeStats.set(value);
	}
	get multiShopRestockUnlocked() {
		return get(this.w_multiShopRestockUnlocked);
	}
	set multiShopRestockUnlocked(value: boolean) {
		this.w_multiShopRestockUnlocked.set(value);
	}
	get multiShopAutoRestockUnlocked() {
		return get(this.w_multiShopAutoRestockUnlocked);
	}
	set multiShopAutoRestockUnlocked(value: boolean) {
		this.w_multiShopAutoRestockUnlocked.set(value);
	}
	get multiShopAutoRestockToggled() {
		return get(this.w_multiShopAutoRestockToggled);
	}
	set multiShopAutoRestockToggled(value: boolean) {
		this.w_multiShopAutoRestockToggled.set(value);
	}
	get restockCounter() {
		return get(this.w_restockCounter);
	}
	set restockCounter(value: number) {
		this.w_restockCounter.set(value);
	}
	get restockInterval() {
		return get(this.w_restockInterval);
	}
	set restockInterval(value: number) {
		this.w_restockInterval.set(value);
	}

	w_lifetimeStats: Writable<{ [key: string]: number }> = writable({
		coffeeSold: 0,
		moneyMade: 0,
		coffeeMade: 0,
		totalRestocked: 0,
	});

	// internal stats ////////////////////////////////////////////////////////////
	upgrades: Map<string, number> = new Map();
	// upgradeFunctions: ((shop: Shop, level: number) => void)[] = [];
	weeklyRecap: { [key: number]: ShopWeekReport } = {};
	sceneManager: Publisher;
	minAppeal: number = 0;
	promotionEffectiveness: number = 0;
	runTutorial: boolean = true;
	audio: Map<string, HTMLAudioElement> = new Map();

	multiShopUgradeManager: UpgradeManager = new UpgradeManager("multiShop");
	localShopUpgradeManager: UpgradeManager = new UpgradeManager("localShop");
	audioManager: AudioManager = new AudioManager();
	timer: Publisher;

	// updgrade gates
	commercialLicenseUnlocked: boolean = false;
	employeeTrainingUnlocked: boolean = false;

	constructor(timer: Publisher, sceneManager: Publisher) {
		console.log("preshop constructor");
		this.timer = timer;
		this.timer.subscribe(this, "tick");
		this.timer.subscribe(this, "hour");
		this.timer.subscribe(this, "day");
		this.timer.subscribe(this, "week");
		this.sceneManager = sceneManager;

		// Clean up other audio managers
		cleanupAudioManagers(this.audioManager);

		// Setting up audio
		this.audioManager.addMusic("bgm", aud.shop_music);
		this.audioManager.addSFX("ding", aud.ding);
		this.audioManager.addSFX("crunch", aud.crunch2);
		this.audioManager.addSFX("papers", aud.papers);
		this.audioManager.addSFX("cashRegister", aud.new_cash);
		this.audioManager.setMaxVolumeScale("cashRegister", 0.5);

		this.audioManager.playAudio("bgm");
		// Fade in bgm
		this.audioManager.setVolume("bgm", 0);
		this.audioManager.fadeAudio("bgm", 1000, 1);

		this.shops.push(new Shop(this, this.audioManager));
		this.weeklyRecap[this.shops.length - 1] = {
			income: 0,
			expenses: 0,
		};
		this.selectShop(this.shops[0]);
	}

	notify(event: string, data?: any) {
		// maybe optimize better :/ dont need to call every shop every tick
		if (event === "tick") {
			this.tick();
		}
		if (event === "hour") {
		}
		if (event === "day") {
		}
		if (event === "week") {
			this.withdrawAll(false);
		}
	}

	tick() {
		this.shops.forEach((shop) => shop.tick(this));
		if (this.multiShopAutoRestockToggled) {
			this.restockCounter = (this.restockCounter + 1) % this.restockInterval;
			if (this.restockCounter === 0) {
				this.restockShops();
			}
		}
	}

	// multishop actions /////////////////////////////////////////////////////////
	addShop(applyUpgrades: boolean = true) {
		let newShop = new Shop(this, this.audioManager);
		if (this.finishedFirstShop) newShop.multiShopUnlocked = true;
		if (applyUpgrades) {
			this.upgrades.forEach((value, key) => {
				console.log(key);
				if (
					this.multiShopUgradeManager.allUpgrades[key].flags?.includes(
						"applyToChildren",
					)
				) {
					// pain peko
					for (let i = 0; i < value; i++) {
						this.multiShopUgradeManager.allUpgrades[key].upgrade(
							newShop,
							value - 1,
						);
					}
				}
			});
		}
		// this.shops.push(newShop);
		// this.w_shops.update((shops) => [...shops, newShop]);
		this.shops = [...this.shops, newShop];

		this.weeklyRecap[this.shops.length - 1] = {
			income: 0,
			expenses: 0,
		};
	}

	selectShop(shop: Shop) {
		this.selectedShop = shop;
		this.selectedShop.isSelected = true;
		this.selectedShopIndex = this.shops.indexOf(shop);
	}

	selectShopIndex(index: number) {
		this.selectedShopIndex = index;
		this.selectedShop = this.shops[index];
		this.selectedShop.isSelected = true;
	}

	deselectShop() {
		if (this.selectedShop) {
			this.selectedShop.isSelected = false;
		}
		this.selectedShop = null;
		this.selectedShopIndex = -1;
	}

	withdrawAll(playSound: boolean = true) {
		let shopIndex = 0;
		console.log("withdraw all");
		if (playSound) this.audioManager.playAudio("ding");
		this.shops.forEach((shop) => {
			this.money += shop.money;
			this.weeklyRecap[shopIndex].income = shop.money;
			shop.money = 0;
		});
	}
	restockShops(playSound: boolean = true) {
		if (playSound) this.audioManager.playAudio("ding");
		this.shops.forEach((shop) => {
			if (shop.autoRestockUnlocked) shop.restock(false);
		});
	}

	// end scene /////////////////////////////////////////////////////////////////

	applyCost(cost: number) {
		this.money -= cost;
		if (this.money < 0) {
			// apply debt?
		}
	}

	// end scene /////////////////////////////////////////////////////////////////

	endScene() {
		console.log("multishop endScene()");
		// Fade out shop bgm
		this.audioManager.fadeAudio(
			"bgm",
			1000,
			0,
			() => this.audioManager.stopAudio("bgm"),
		);
		this.sceneManager.emit("nextScene");

		this.timer.unsubscribe(this, "tick");
		this.timer.unsubscribe(this, "hour");
		this.timer.unsubscribe(this, "day");
		this.timer.unsubscribe(this, "week");
	}

	getTransferData() {
		return {
			money: this.money,
			upgrades: this.upgrades,
			numShops: this.shops.length,
			lifetimeStats: this.lifetimeStats,
		};
	}

	loadTransferData(data: any): void {
		this.money += data.money;
		this.lifetimeStats.coffeeSold = data.lifetimeCoffeeSold;
		this.lifetimeStats.coffeeMade = data.lifetimeCoffeeMade;
		this.shops[0].beans += data.beans;
		this.selectShop(this.shops[0]);
	}

	// selected shop actions /////////////////////////////////////////////////////
	// actions you can do at the selected shop
	localSellCoffee() {
		this.audioManager.playAudio("ding");
		if (!this.selectedShop) return;
		this.selectedShop.sellCoffee();
	}

	localPromote() {
		// this.audioManager.playAudio("ding");
		if (!this.selectedShop) return;
		this.selectedShop.promote();
	}

	localProduceCoffee() {
		// this.audioManager.playAudio("ding");
		if (!this.selectedShop) return;
		this.selectedShop.produceCoffee();
	}

	localWithdrawMoney() {
		this.audioManager.playAudio("ding");
		if (!this.selectedShop) return;
		this.money += this.selectedShop.money;
		this.selectedShop.money = 0;
	}

	// save state ////////////////////////////////////////////////////////////////

	saveState() {
		let saveObj: MultiShopSave = {
			money: this.money,
			selectedShopIndex: this.selectedShopIndex,
			upgrades: {},
			shops: [],
			lifetimeStats: this.lifetimeStats,
			multiShopRestockUnlocked: this.multiShopRestockUnlocked,
			multiShopAutoRestockUnlocked: this.multiShopAutoRestockUnlocked,
			multiShopAutoRestockToggled: this.multiShopAutoRestockToggled,
			commercialLicenseUnlocked: this.commercialLicenseUnlocked,
			employeeTrainingUnlocked: this.employeeTrainingUnlocked,
		};

		for (let [key, value] of this.upgrades) {
			saveObj.upgrades[key] = value;
		}

		for (let shop of this.shops) {
			saveObj.shops.push(shop.getSaveState());
		}

		localStorage.setItem("multishop", JSON.stringify(saveObj));
	}

	loadState() {
		const rawJSON = localStorage.getItem("multishop");

		if (rawJSON === null) return;

		const state: MultiShopSave = JSON.parse(rawJSON);
		this.lifetimeStats = state.lifetimeStats;

		// check that multishop upgrades work fine loading in like this, especially "apply to all" upgrades
		this.upgrades = new Map(Object.entries(state.upgrades));

		this.selectedShopIndex = state.selectedShopIndex;
		this.multiShopRestockUnlocked = state.multiShopRestockUnlocked;
		this.multiShopAutoRestockUnlocked = state.multiShopAutoRestockUnlocked;
		this.multiShopAutoRestockToggled = state.multiShopAutoRestockToggled;
		this.commercialLicenseUnlocked = state.commercialLicenseUnlocked;
		this.employeeTrainingUnlocked = state.employeeTrainingUnlocked;

		for (let i = 0; i < state.shops.length; i++) {
			// only add new shop if shops > 1
			if (i >= this.shops.length) {
				this.addShop(false);

			}
			this.shops[i].loadLocalState(state.shops[i]);
		}

		this.money = state.money;

		if (!this.audioManager || !audioManagerRegistry.has(this.audioManager)) {
			this.audioManager = new AudioManager();
			this.audioManager.addMusic("bgm", aud.shop_music);
			this.audioManager.addSFX("ding", aud.ding);
			this.audioManager.addSFX("crunch", aud.crunch2);
			this.audioManager.addSFX("papers", aud.papers);
			this.audioManager.addSFX("cashRegister", aud.new_cash);
			this.audioManager.setMaxVolumeScale("cashRegister", 0.5);

			this.audioManager.playAudio("bgm");
			// Fade in bgm
			this.audioManager.setVolume("bgm", 0);
			this.audioManager.fadeAudio("bgm", 1000, 1);
		}
	}

	clearState() { }
}

interface ShopWeekReport {
	income: number;
	expenses: number;
}

interface MultiShopSave {
	money: number;
	selectedShopIndex: number;
	upgrades: { [key: string]: number };
	shops: LocalShopSave[];
	lifetimeStats: { [key: string]: number };
	multiShopRestockUnlocked: boolean;
	multiShopAutoRestockUnlocked: boolean;
	multiShopAutoRestockToggled: boolean;
	commercialLicenseUnlocked: boolean;
	employeeTrainingUnlocked: boolean;

}
