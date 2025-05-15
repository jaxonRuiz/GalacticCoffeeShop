import { AudioManager } from "./audioManager";
import { aud } from "../../assets/aud";

const unlockStages: boolean = false;
const playtesterMode: boolean = true;
const unlockAllUpgrades: boolean = false; // for testing purposes

export class UpgradeManager {
	// updgrades of a specific subset (preshop, shop, etc)
	allUpgrades: { [key: string]: IUpgrade };
	audioManager: AudioManager;

	constructor(subset: string) {
		this.allUpgrades = upgradeJSON[subset];
		this.audioManager = new AudioManager();
		this.audioManager.addSFX("upgrade", aud.upgrade);
		this.audioManager.setVolume("upgrade", 0.5);
	}

	applyUpgrade(id: string, shopObject: IShop) {
		this.audioManager.playAudio("upgrade");

		// if multishop style
		if (this.allUpgrades[id].flags?.includes("applyToChildren")) {
			// maybe set it up so multishop upgrades show up in local shops?
			shopObject.shops!.forEach((shop: IShop) => {
				this.allUpgrades[id].upgrade(shop, shopObject.upgrades.get(id) ?? 0);
			}); // uses level of multishop
			shopObject.applyCost(this.getCost(id, shopObject));
			shopObject.upgrades.set(id, (shopObject.upgrades.get(id) ?? 0) + 1);
		} else {
			// if single shop style
			this.allUpgrades[id].upgrade(
				shopObject,
				shopObject.upgrades.get(id) ?? 0,
			);
			shopObject.applyCost(this.getCost(id, shopObject));
			shopObject.upgrades.set(id, (shopObject.upgrades.get(id) ?? 0) + 1);
		}
	}

	getCost(id: string, shopObject: IShop) {
		if (shopObject.upgrades.get(id) === undefined) {
			return this.allUpgrades[id].cost;
		}
		// cost * (costMultiplier ^ level)
		return (
			this.allUpgrades[id].cost *
			Math.pow(
				this.allUpgrades[id].costMultiplier,
				shopObject.upgrades.get(id) ?? 0,
			)
		);
	}

	// returns all purchasable upgrades (AS ID KEYS) at shop
	checkUpgrade(shopObject: IShop) {
		let unpurchasedUpgrades = Object.keys(this.allUpgrades).filter(
			(id: string) => {
				if (this.allUpgrades[id].maxLevel === undefined) return true;
				else if (
					(shopObject.upgrades.get(id) ?? 0) < this.allUpgrades[id].maxLevel
				) {
					return true;
				}
				return false;
			},
		);

		return unpurchasedUpgrades.filter((id: string) => {
			if (unlockAllUpgrades) return true;
			return this.allUpgrades[id].unlock_condition(shopObject);
		});
	}
}

// need to have a
const playtesterMultiplier = 3;
//  way to designate upgrade caps and single upgrades
export let upgradeJSON: { [key: string]: { [key: string]: IUpgrade } } = {
	preshop: {
		play_tester_mode: {
			unlock_condition: (_shop) => {
				return playtesterMode;
			},
			upgrade: (shop) => {
				(shop as IPreshop).moneyMultiplier = playtesterMultiplier;
			},
			maxLevel: 1,
			cost: 0,
			costMultiplier: 1,
			image: "boop_star",
		},

		buy_coffee_shop: {
			unlock_condition: (shop) => {
				if (unlockStages) return true;
				return (shop as IPreshop).lifetimeCoffeeSold >= 250 / 2; // divide by 2 for playtest
			},
			upgrade: (shop) => {
				(shop as IPreshop).money -= 600;
				(shop as IScene).endScene();
			},
			maxLevel: 1,
			cost: 600,
			costMultiplier: 1,
			image: "astrorat",
			flags: ["yellow"],
		},

		water_boiler: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeMade > 5;
			},
			upgrade: (shop) => {
				(shop as IPreshop).makeCoffeeCooldown -= 4000;
				(shop as IPreshop).makeCoffeeQuantity! += 1;
			},
			maxLevel: 1,
			cost: 14,
			costMultiplier: 1.5,
			image: "upg_brew",
		},

		crank_grinder: {
			unlock_condition: (shop) => {
				let level = (shop as IPreshop).upgrades.get("crank_grinder") ?? 0;
				let condition = [2, 10];
				return (shop as IPreshop).lifetimeGrindBeans > 2;
			},
			upgrade: (shop) => {
				let level = (shop as IPreshop).upgrades.get("crank_grinder") ?? 0;
				let grindTime = [4, 2, 2];
				(shop as IPreshop).grindTime -= 4;
			},
			maxLevel: 2,
			cost: 8,
			costMultiplier: 1.75,
			image: "upg_grind",
		},

		word_of_mouth: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeSold >= 3;
			},
			upgrade: (shop) => {
				(shop as IPreshop).maxAppeal! += 0.1;
				(shop as IPreshop).appealDecay -= 0.15;
				(shop as IPreshop).promotionEffectiveness! += 0.05;
			},
			maxLevel: 1,
			cost: 5,
			costMultiplier: 1,
			image: "upg_promote",
		},

		deluxe_coffee_pot: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).upgrades.get("water_boiler")! >= 1 &&
					(shop as IPreshop).lifetimeCoffeeMade > 10;
			},
			upgrade: (shop) => {
				(shop as IPreshop).makeCoffeeQuantity! += 4;
				(shop as IPreshop).makeCoffeeCooldown += 2000;
			},
			maxLevel: 2,
			cost: 13,
			costMultiplier: 1.35,
			image: "upg_brew",
		},

		enlist_younger_sibling: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("crank_grinder") ?? 0) >= 1 &&
					(shop as IPreshop).lifetimeGrindBeans > 13;
			},
			upgrade: (shop) => {
				(shop as IPreshop).autogrindingEnabled = true;
			},
			maxLevel: 1,
			cost: 20,
			costMultiplier: 1,
			image: "upg_grind",
		},

		hire_neighborhood_kid: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("word_of_mouth") ?? 0) >= 1 &&
					(shop as IPreshop).lifetimeCoffeeMade > 8;
			},
			upgrade: (shop) => {
				(shop as IPreshop).autosellEnabled = true;
			},
			maxLevel: 1,
			cost: 30,
			costMultiplier: 1.5,
			image: "upg_sell",
		},

		tip_jar: {
			unlock_condition: (shop) => {
				return shop.upgrades.get("hire_neighborhood_kid")! >= 1 &&
					shop.upgrades.get("deluxe_coffee_pot")! >= 1 &&
					shop.upgrades.get("enlist_younger_sibling")! >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).coffeePrice += 1;
			},
			maxLevel: 1,
			cost: 10,
			costMultiplier: 1.2,
			image: "upg_sell",
		},

		makeshift_coffee_refiller: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("water_boiler") ?? 0) >= 1 &&
					(shop as IPreshop).lifetimeCoffeeMade > 15;
			},
			upgrade: (shop) => {
				(shop as IPreshop).makeCoffeeMaxBatches += 1;
			},
			maxLevel: 1,
			cost: 23,
			costMultiplier: 1,
			image: "upg_brew",
		},

		efficient_grinding: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("enlist_younger_sibling") ?? 0) >= 1 &&
					(shop as IPreshop).lifetimeGrindBeans > 30;
			},
			upgrade: (shop) => {
				(shop as IPreshop).coffeePerBean += 1.5;
			},
			maxLevel: 1,
			cost: 22,
			costMultiplier: 1.7,
			image: "upg_grind",
		},

		neighborhood_kid_incentive: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("hire_neighborhood_kid") ?? 0) >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).autosellInterval -= 2;
			},
			maxLevel: 3,
			cost: 40,
			costMultiplier: 1.45,
			image: "upg_sell",
		},

		sibling_incentive: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("enlist_younger_sibling") ?? 0) >= 1 &&
					(shop as IPreshop).lifetimeGrindBeans > 40;
			},
			upgrade: (shop) => {
				(shop as IPreshop).autogrindInterval -= 2;
			},
			maxLevel: 3,
			cost: 40,
			costMultiplier: 1.45,
			image: "upg_grind",
		},

		promotional_posters: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeSold >= 10 &&
					(shop as IPreshop).upgrades.get("hire_neighborhood_kid")! >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).promotionEffectiveness += 0.15;
				(shop as IPreshop).minAppeal! += 0.05;
				(shop as IPreshop).maxAppeal! += 0.1;
				(shop as IPreshop).maxCustomers! += 1;
			},
			maxLevel: 3,
			cost: 18,
			costMultiplier: 1.3,
			image: "upg_promote",
		},

		lingering_appeal: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeSold > 50 &&
					shop.upgrades.get("promotional_posters")! >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).appealDecay -= 0.1;
			},
			maxLevel: 1,
			cost: 100,
			costMultiplier: 1.5,
			image: "upg_promote",
		},

		multi_grinder: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("efficient_grinding") ?? 0) >= 1 &&
					(shop.upgrades.get("sibling_incentive") ?? 0) >= 1 &&
					shop.upgrades.get("tip_jar")! >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).grindQuantity += 1;
			},
			maxLevel: 1,
			cost: 90,
			costMultiplier: 1.6,
			image: "upg_grind",
		},

		// bulk_bean_deal: {
		// 	unlock_condition: (shop) => {
		// 		let level = shop.upgrades.get("bulk_bean_deal") ?? 0;
		// 		let condition = [50, 100, 200];
		// 		return (shop as IPreshop).lifetimeGrindBeans >= condition[level];
		// 	},
		// 	upgrade: (shop) => {
		// 		let level = (shop as IPreshop).upgrades.get("bulk_bean_deal") ?? 0;
		// 		let beanPrice = [10.99, 17.99, 35.99];
		// 		let beanAmount = [15, 25, 50];
		// 		(shop as IPreshop).beanPrice = beanPrice[level];
		// 		(shop as IPreshop).beansPerBuy = beanAmount[level];
		// 	},
		// 	maxLevel: 3,
		// 	cost: 25,
		// 	costMultiplier: 2,
		// 	image: "bulk_bean_deal.jpg",
		// },

		automatic_coffee_refiller: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeMade > 40 &&
					(shop.upgrades.get("enlist_younger_sibling") ?? 0) >= 1 &&
					shop.upgrades.get("tip_jar")! >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).makeCoffeeMaxBatches += 2;
			},
			maxLevel: 3,
			cost: 80,
			costMultiplier: 1.5,
			image: "upg_brew",
		},

		// preshop_nicer_coffee: {
		// 	unlock_condition: (shop) => {
		// 		let thresholds = [20, 30, 50, 80, 100, 150, 170, 200, 220, 250];
		// 		let level = shop.upgrades.get("nicer_coffee") ?? 0;
		// 		return (shop as IPreshop).lifetimeCoffeeSold >= thresholds[level];
		// 	},
		// 	upgrade: (shop) => {
		// 		(shop as IPreshop).coffeePrice += 0.35;
		// 	},
		// 	maxLevel: 10,
		// 	cost: 20,
		// 	costMultiplier: 1.23,
		// 	image: "better_coffee.jpg",
		// },

		express_coffee_maker: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeMade >= 15 &&
					(shop.upgrades.get("deluxe_coffee_pot") ?? 0) >= 2 &&
					shop.upgrades.get("tip_jar")! >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).makeCoffeeCooldown -= 2000;
			},
			maxLevel: 2,
			cost: 120,
			costMultiplier: 2,
			image: "upg_brew",
		},
	},

	localShop: {
		play_tester_mode: {
			unlock_condition: (_shop) => {
				return playtesterMode;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).moneyMultiplier = playtesterMultiplier;
			},
			maxLevel: 1,
			cost: 0,
			costMultiplier: 1,
			image: "boop_star",
		},
		unlock_multishop: {
			unlock_condition: (shop) => {
				if (unlockStages) return true;
				if ((shop as ILocalShop).multiShopUnlocked) return false;
				return (shop as ILocalShop).lifetimeStats.coffeeMade >= 100;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).multiShopUnlocked = true;
			},
			maxLevel: 1,
			cost: 200,
			costMultiplier: 1,
			image: "astrorat",
			flags: ["yellow"],
		},
		employee_orientation: {
			unlock_condition: (shop) => {
				return true;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.serverFlatProductivity! += 0.1;
				(shop as ILocalShop).workerStats.baristaFlatProductivity! += 0.1;
			},
			maxLevel: 1,
			cost: 70,
			costMultiplier: 1.5,
			image: "boop_star",
		},
		flashy_sign: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 100;
			},
			upgrade: (shop, level) => {
				let statLevels = [0.1, 0.15, 0.18];
				(shop as ILocalShop).minAppeal! += statLevels[level];
				(shop as ILocalShop).appealDecay *= 0.97;
				if ((shop as ILocalShop).appeal < (shop as ILocalShop).minAppeal!) {
					(shop as ILocalShop).appeal = (shop as ILocalShop).minAppeal!;
				}
			},
			maxLevel: 1,
			cost: 150,
			costMultiplier: 1,
			image: "upg_promote",
		},

		trendy_aesthetic: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 200 &&
					shop.upgrades.has("flashy_sign");
			},
			upgrade: (shop, level) => {
				let statLevels = [0.1, 0.15, 0.18];
				(shop as ILocalShop).minAppeal! += statLevels[level];
				(shop as ILocalShop).appealDecay *= 0.97;
				if ((shop as ILocalShop).appeal < (shop as ILocalShop).minAppeal!) {
					(shop as ILocalShop).appeal = (shop as ILocalShop).minAppeal!;
				}
			},
			maxLevel: 1,
			cost: 120,
			costMultiplier: 1.2,
			image: "upg_promote",
		},

		expand_cashier_counter: {
			unlock_condition: (shop) => {
				return true;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerAmounts["serverMax"] += 1;
			},
			maxLevel: 3,
			cost: 200,
			costMultiplier: 1.5,
			image: "upg_sell",
		},
		additional_promotion_materials: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).promoterUnlocked;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerAmounts["promoterMax"] += 1;
			},
			maxLevel: 3,
			cost: 400,
			costMultiplier: 1.5,
			image: "upg_promote",
		},
		expand_coffee_bar: {
			unlock_condition: (shop) => {
				return true;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerAmounts["baristaMax"] += 1;
			},
			maxLevel: 3,
			cost: 200,
			costMultiplier: 1.5,
			image: "upg_brew",
		},
		upgrade_cash_register: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 10 &&
					shop.upgrades.has("expand_cashier_counter");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.serverFlatProductivity! += 0.1;
			},
			maxLevel: 1,
			cost: 500,
			costMultiplier: 1.15,
			image: "upg_sell",
		},
		increase_customer_flow: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 40 &&
					shop.upgrades.has("flashy_sign");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.serverCumulativeProductivity! += 0.15;
			},
			maxLevel: 5,
			cost: 550,
			costMultiplier: 1.2,
			image: "upg_sell",
		},
		better_coffee_machine: {
			unlock_condition: (shop) => {
				return shop.upgrades.has("expand_coffee_bar");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.baristaCumulativeProductivity! += 0.05;
				(shop as ILocalShop).workerStats.baristaFlatProductivity! += 0.03;
			},
			maxLevel: 1,
			cost: 800,
			costMultiplier: 1,
			image: "upg_brew",
		},

		promoter_effectiveness: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).promoterUnlocked;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.promoterProductivity! += 0.05;
				(shop as ILocalShop).promotionEffectiveness += 0.05;
			},
			maxLevel: 3,
			cost: 400,
			costMultiplier: 1.3,
			image: "upg_promote",
		},
		local_shop_nicer_coffee: {
			unlock_condition: (shop) => {
				return shop.upgrades.has("better_coffee_machine");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).coffeePrice += 0.35;
			},
			maxLevel: 3,
			cost: 400,
			costMultiplier: 1.23,
			image: "upg_sell",
		},
		fancy_latte_art: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeMade >= 100 &&
					shop.upgrades.has("local_shop_nicer_coffee");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.baristaCumulativeProductivity! += 0.1;
				(shop as ILocalShop).coffeePrice += 1;
				(shop as ILocalShop).promotionEffectiveness += 0.1;
			},
			maxLevel: 1,
			cost: 500,
			costMultiplier: 1.2,
			image: "upg_brew",
		},
		// unlock_auto_restock: {
		// 	unlock_condition: (shop) => {
		// 		return (shop as ILocalShop).lifetimeStats.totalRestocked >= 100;
		// 	},
		// 	upgrade: (shop) => {
		// 		(shop as ILocalShop).autoRestockUnlocked = true;
		// 	},
		// 	maxLevel: 1,
		// 	cost: 200,
		// 	costMultiplier: 1,
		// 	image: "local_shop_nicer_coffee.jpg", //replace with correct image !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// },
	},

	multiShop: {
		establish_franchise: {
			unlock_condition: (multishop) => {
				if (unlockStages) return true;
				return (multishop as IMultiShop).shops!.length > 3;
			},
			upgrade: (shop) => {
				(shop as IScene).endScene();
			},
			maxLevel: 1,
			cost: 10000,
			costMultiplier: 1,
			image: "astrorat",
		},
		// apply to children style upgrades have the associated flag. their upgrade function applies to the LOCAL shops

		consistent_imaging: {
			unlock_condition: (multishop) => {
				return true;
			},
			upgrade: (shop, level) => {
				console.log("applying upgrade to local shop");
				(shop as ILocalShop).minAppeal! += 0.1;
				(shop as ILocalShop).maxAppeal! += 0.2;
			},
			flags: ["applyToChildren"],
			maxLevel: 1,
			cost: 200,
			costMultiplier: 1.5,
			image: "upg_promote",
		},
		cohesive_branding: {
			unlock_condition: (multishop) => {
				return multishop.shops!.length > 1; // maybe change to 2 later
			},
			upgrade: (shop, level) => {
				console.log("applying upgrade to local shop");
				(shop as ILocalShop).minAppeal! += 0.2;
				(shop as ILocalShop).promotionEffectiveness += 0.1;
			},
			flags: ["applyToChildren"],
			maxLevel: 3,
			cost: 1000,
			costMultiplier: 1.5,
			image: "upg_promote",
		},
		unlock_promoter: {
			unlock_condition: (multishop) => {
				return multishop.shops!.length > 1;
			},
			upgrade: (shop) => {
				console.log("unlocking promoter from multishop");
				(shop as ILocalShop).unlockPromoter();
			},
			maxLevel: 1,
			cost: 300,
			flags: ["applyToChildren"],
			costMultiplier: 1,
			image: "upg_promote",
		},
		unlock_auto_restock: {
			unlock_condition: (multishop) => {
				return multishop.shops!.length > 1;
			},
			upgrade: (shop) => {
				console.log("unlocking promoter from multishop");
				(shop as ILocalShop).autoRestockUnlocked = true;
			},
			maxLevel: 1,
			cost: 1000,
			flags: ["applyToChildren"],
			costMultiplier: 1,
			image: "upg_buy",
		},
		add_new_shop: {
			unlock_condition: (multishop) => {
				return true;
			},
			upgrade: (shop) => {
				(shop as IContainerShop).addShop();
			},
			maxLevel: 6,
			cost: 700,
			costMultiplier: 1.5,
			image: "coffee",
		},
	},
};
