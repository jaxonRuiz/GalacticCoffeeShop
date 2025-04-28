import { get, type Writable, writable } from "svelte/store";
import { Publisher } from "../systems/observer";
import { type LocalShopSave, Shop } from "./shop";
import { UpgradeManager } from "../systems/upgradeManager";
import { cleanupAudioManagers, AudioManager } from "../systems/audioManager";
import { aud } from "../../assets/aud";

export class MultiShop implements ISubscriber, IScene, IMultiShop {
	// writable resources
	w_money: Writable<number> = writable(0);
	w_selectedShop: Writable<Shop | null> = writable(null);
	w_selectedShopIndex: Writable<number> = writable(-1);
	w_shops: Writable<Shop[]> = writable([]);
	w_finishedFirstShop: Writable<boolean> = writable(false);

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

	constructor(timer: Publisher, sceneManager: Publisher) {
		timer.subscribe(this, "tick");
		timer.subscribe(this, "day");
		timer.subscribe(this, "week");
		this.sceneManager = sceneManager;

		this.shops.push(new Shop(this, this.audioManager));
		this.weeklyRecap[this.shops.length - 1] = {
			income: 0,
			expenses: 0,
		};

		// Clean up other audio managers
		cleanupAudioManagers(this.audioManager);

		// Setting up audio
		this.audioManager.addMusic("bgm", aud.shop_music);
		this.audioManager.addSFX("ding", aud.ding);
		this.audioManager.playAudio("bgm");
	}

	notify(event: string, data?: any) {
		// maybe optimize better :/ dont need to call every shop every tick
		if (event === "tick") {
			this.tick();
		}
		if (event === "day") {
			this.restockShops();
		}
		if (event === "week") {
			this.withdrawAll();

			// this.applyExpenses();
			// this.shops.forEach((shop) => shop.restock());


		}
	}



	// // multishop actions /////////////////////////////////////////////////////////
	// addShop(applyUpgrades: boolean = true) {
	// 	let newShop = new Shop(this);
	// 	if (this.finishedFirstShop) newShop.multiShopUnlocked = true;
	// 	if (applyUpgrades) {
	// 		this.upgrades.forEach((value, key) => {
	// 			console.log(key);
	// 			if (
	// 				this.multiShopUgradeManager.allUpgrades[key].flags?.includes(
	// 					"applyToChildren",
	// 				)
	// 			) {
	// 				// pain peko
	// 				for (let i = 0; i < value; i++) {
	// 					this.multiShopUgradeManager.allUpgrades[key].upgrade(
	// 						newShop,
	// 						value - 1,
	// 					);
	// 				}
	// 			}
	// 		});
	// 	}

	// 	// this.shops.push(newShop);
	// 	this.w_shops.update((shops) => [...shops, newShop]);
	// }

	tick() {
		this.shops.forEach((shop) => shop.tick(this));
	}

	// multishop actions /////////////////////////////////////////////////////////
	addShop(applyUpgrades: boolean = true) {
		this.audioManager.playAudio("ding");
		let newShop = new Shop(this, this.audioManager);
		if (this.finishedFirstShop) newShop.multiShopUnlocked = true;
		if (applyUpgrades) {
			this.upgrades.forEach((value, key) => {
				console.log(key);
				if (
					this.multiShopUgradeManager.allUpgrades[key].flags?.includes(
						"applyToChildren"
					)
				) {
					// pain peko
					for (let i = 0; i < value; i++) {
						this.multiShopUgradeManager.allUpgrades[key].upgrade(
							newShop,
							value - 1
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
		if (this.selectedShop) this.selectedShop!.isSelected = false;
		this.selectedShop = null;
		this.selectedShopIndex = -1;
	}

	applyExpenses() {
		let shopIndex = 0;
		this.shops.forEach((shop) => {
			this.money -= shop.getTotalExpenses();
			this.weeklyRecap[shopIndex].expenses = shop.getTotalExpenses();
		});
	}

	withdrawAll() {
		let shopIndex = 0;
		console.log("withdraw all");
		this.shops.forEach((shop) => {
			this.money += shop.money;
			this.weeklyRecap[shopIndex].income = shop.money;
			shop.money = 0;
		});
	}
	restockShops() {
		this.audioManager.playAudio("ding");
		this.shops.forEach((shop) => {
			if (shop.autoRestockUnlocked) shop.restock();
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
		this.audioManager.disableAudio();
		this.sceneManager.emit("nextScene");
	}

	getTransferData() {
		return {
			money: this.money,
			upgrades: this.upgrades,
			numShops: this.shops.length,
		};
	}

	loadTransferData(data: any): void {
		this.money += data.money;
		this.shops[0].beans += data.beans;
		if (data.hasBarista) {
			this.shops[0].addWorker("barista");
		}
		if (data.hasCashier) {
			this.shops[0].addWorker("server");
		}
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
		this.audioManager.playAudio("ding");
		if (!this.selectedShop) return;
		this.selectedShop.promote();
	}

	localProduceCoffee() {
		this.audioManager.playAudio("ding");
		if (!this.selectedShop) return;
		this.selectedShop.produceCoffee();
	}

	localWithdrawMoney() {
		this.audioManager.playAudio("ding");
		if (!this.selectedShop) return;
		this.money += this.selectedShop.money;
		this.selectedShop.money = 0;
	}

	localAddWorker(role: string) {
		this.audioManager.playAudio("ding");
		if (!this.selectedShop) return;
		this.selectedShop.addWorker(role);
	}

	localRemoveWorker(role: string) {
		this.audioManager.playAudio("ding");
		if (!this.selectedShop) return;
		this.selectedShop.removeWorker(role);
	}

	// save state ////////////////////////////////////////////////////////////////

	saveState() {
		let saveObj: MultiShopSave = {
			money: this.money,
			selectedShopIndex: this.selectedShopIndex,
			upgrades: {},
			shops: [],
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

		// check that multishop upgrades work fine loading in like this, especially "apply to all" upgrades
		this.upgrades = new Map(Object.entries(state.upgrades));

		// this.upgradeFunctions = state.upgradeFunctions;
		this.selectedShopIndex = state.selectedShopIndex;

		for (let i = 0; i < state.shops.length; i++) {
			// only add new shop if shops > 1
			if (i >= this.shops.length) {
				this.addShop(false);
				// let shop = new Shop(this);
				// this.shops.push(shop);
			}
			this.shops[i].loadLocalState(state.shops[i]);
		}

		this.money = state.money;
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
}
