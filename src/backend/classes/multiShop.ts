import { Publisher } from "../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { type LocalShopSave, Shop } from "./shop";

export class MultiShop implements ISubscriber, IScene, IMultiShop {
	// writable resources
	w_money: Writable<number> = writable(0);
	w_selectedShop: Writable<Shop | null> = writable(null);
	w_selectedShopIndex: Writable<number> = writable(-1);

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

	// internal stats ////////////////////////////////////////////////////////////
	shops: Shop[] = []; // make into object for key referencing?
	upgrades: Map<string, number> = new Map();
	upgradeFunctions: ((shop: Shop, level: number) => void)[] = [];
	weeklyRecap: { [key: number]: ShopWeekReport } = {};
	sceneManager: Publisher;
	minAppeal: number = 0;
	promotionEffectiveness: number = 0;
	runTutorial: boolean = true;

	constructor(timer: Publisher, sceneManager: Publisher) {
		timer.subscribe(this, "tick");
		timer.subscribe(this, "week");
		this.sceneManager = sceneManager;

		this.shops.push(new Shop(this));
		this.weeklyRecap[this.shops.length - 1] = {
			income: 0,
			expenses: 0,
		};
	}

	notify(event: string, data?: any) {
		// maybe optimize better :/ dont need to call every shop every tick
		if (event === "tick") {
			this.tick();
		}
		if (event === "week") {
			this.withdrawAll();
			this.applyExpenses();
			this.shops.forEach((shop) => shop.restock());

			if (this.money < 0) {
				console.log("debt boy");
			}
		}
	}

	tick() {
		this.shops.forEach((shop) => shop.tick(this));
	}

	// multishop actions /////////////////////////////////////////////////////////
	addShop(upgradeManager: IUpgradeManager) {
		this.shops.push(new Shop(this));
		for (let key in this.upgrades) {
			if (upgradeManager.allUpgrades[key].flags?.includes("applyToChildren")) {
				this.upgrades.set(key, 1);
			}
		}
		this.weeklyRecap[this.shops.length - 1] = {
			income: 0,
			expenses: 0,
		};
	}

	selectShop(shop: Shop) {
		this.selectedShop = shop;
		this.selectedShopIndex = this.shops.indexOf(shop);
	}

	selectShopIndex(index: number) {
		this.selectedShopIndex = index;
		this.selectedShop = this.shops[index];
	}

	deselectShop() {
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
		this.shops.forEach((shop) => {
			this.money += shop.money;
			this.weeklyRecap[shopIndex].income = shop.money;
			shop.money = 0;
		});
	}

	applyCost(cost: number) {
		this.money -= cost;
		if (this.money < 0) {
			// apply debt?
		}
	}

	// end scene /////////////////////////////////////////////////////////////////

	endScene() {
		console.log("multishop endScene()");
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
			this.shops[0].addWorker("cashier");
		}
	}

	// selected shop actions /////////////////////////////////////////////////////
	// actions you can do at the selected shop
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
		this.money += this.selectedShop.money;
		this.selectedShop.money = 0;
	}

	localAddWorker(role: string) {
		if (!this.selectedShop) return;
		this.selectedShop.addWorker(role);
	}

	localRemoveWorker(role: string) {
		if (!this.selectedShop) return;
		this.selectedShop.removeWorker(role);
	}

	// save state ////////////////////////////////////////////////////////////////

	saveState() {
		let saveObj: MultiShopSave = {
			money: this.money,

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

		// check that multishop upgrades work fine loading in like this
		this.upgrades = new Map(Object.entries(state.upgrades));

		for (let i = 0; i < state.shops.length; i++) {
			// only add new shop if shops > 1
			if (i > 0) {
				let shop = new Shop(this);
				this.shops.push(shop);
			}
			this.shops[i].loadLocalState(state.shops[i]);
		}
	}

	clearState() {
	}
}

interface ShopWeekReport {
	income: number;
	expenses: number;
}

interface MultiShopSave {
	money: number;
	upgrades: { [key: string]: number };
	shops: LocalShopSave[];
}
