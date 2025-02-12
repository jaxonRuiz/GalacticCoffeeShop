import { Publisher } from "../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { Shop } from "./shop";

export class MultiShop implements ISubscriber, IScene {
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

	endScene() {
		console.log("multishop endScene()");
		this.sceneManager.emit("nextScene");
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
		this.selectedShop.addWorker(role, this);
	}

	localRemoveWorker(role: string) {
		if (!this.selectedShop) return;
		this.selectedShop.removeWorker(role);
	}
}

interface ShopWeekReport {
	income: number;
	expenses: number;
}
