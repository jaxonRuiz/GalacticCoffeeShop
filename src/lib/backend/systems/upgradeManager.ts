import { AudioManager } from "./audioManager";
import { aud } from "../../assets/aud";
// will have diff upgrade manager for each subset (preshop, shop, etc)
export class UpgradeManager {
	// updgrades of a specific subset (preshop, shop, etc)
	allUpgrades: { [key: string]: IUpgrade };
	audioManager: AudioManager;

	constructor(subset: string) {
		this.allUpgrades = upgradeJSON[subset];
		this.audioManager = new AudioManager();
	}

	applyUpgrade(id: string, shopObject: IShop) {
		this.audioManager.addSFX("upgrade", aud.upgrade);
		this.audioManager.setVolume("upgrade", 0.5);
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
			return this.allUpgrades[id].unlock_condition(shopObject);
		});
	}
}

// need to have a
const playtesterMultiplier = 3;
//  way to designate upgrade caps and single upgrades
export let upgradeJSON: { [key: string]: { [key: string]: IUpgrade } } = {
	preshop: {
		// play_tester_mode: {
		// 	unlock_condition: (_shop) => {
		// 		return true;
		// 	},
		// 	upgrade: (shop) => {
		// 		shop.moneyMultiplier = playtesterMultiplier;
		// 	},
		// 	maxLevel: 1,
		// 	cost: 0,
		// 	costMultiplier: 1,
		// 	image: "play_tester_mode.jpg",
		// },

		buy_coffee_shop: {
			unlock_condition: (shop) => {
				// return true;
				return (shop as IPreshop).lifetimeCoffeeSold >= 250 / 2; // divide by 2 for playtest
			},
			upgrade: (shop) => {
				(shop as IScene).endScene();
			},
			maxLevel: 1,
			cost: 600,
			costMultiplier: 1,
			image: "buy_coffee_shop.jpg",
			flags: ["yellow"],
		},

		crank_grinder: {
			unlock_condition: (shop) => {
				let level = (shop as IPreshop).upgrades.get("crank_grinder") ?? 0;
				let condition = [2, 10];
				return (shop as IPreshop).lifetimeGrindBeans > 2;
			},
			upgrade: (shop) => {
				(shop as IPreshop).grindTime -= 2;
			},
			maxLevel: 2,
			cost: 8,
			costMultiplier: 2.5,
			image: "crank_grinder.jpg",
		},

		deluxe_coffee_pot: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeMade > 8;
			},
			upgrade: (shop) => {
				(shop as IPreshop).makeCoffeeQuantity! += 3;
				(shop as IPreshop).makeCoffeeCooldown += 1000;
			},
			maxLevel: 3,
			cost: 13,
			costMultiplier: 1.15,
			image: "deluxe_coffee_pot.jpg",
		},

		word_of_mouth: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeSold >= 20;
			},
			upgrade: (shop) => {
				(shop as IPreshop).minAppeal! += 0.05;
			},
			maxLevel: 1,
			cost: 50,
			costMultiplier: 1,
			image: "word_of_mouth.jpg",
		},

		promotional_posters: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeSold >= 10 &&
					(shop as IPreshop).upgrades.get("word_of_mouth")! >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).promotionEffectiveness += 0.08;
				(shop as IPreshop).minAppeal! += 0.05;
				(shop as IPreshop).maxAppeal! += 0.1;
				(shop as IPreshop).maxCustomers! += 1;
			},
			maxLevel: 5,
			cost: 40,
			costMultiplier: 1.3,
			image: "promotional_posters.jpg",
		},

		makeshift_coffee_refiller: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeMade > 15;
			},
			upgrade: (shop) => {
				(shop as IPreshop).makeCoffeeBatches += 1;
			},
			maxLevel: 1,
			cost: 30,
			costMultiplier: 1,
			image: "makeshift_coffee_refiller.jpg",
		},

		enlist_younger_sibling: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("crank_grinder") ?? 0) >= 1 &&
					(shop as IPreshop).lifetimeGrindBeans > 20;
			},
			upgrade: (shop) => {
				(shop as IPreshop).autogrindingEnabled = true;
			},
			maxLevel: 1,
			cost: 50,
			costMultiplier: 1,
			image: "enlist_sibling.jpg",
		},

		sibling_incentive: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("enlist_younger_sibling") ?? 0) >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).autogrindInterval -= 2;
			},
			maxLevel: 3,
			cost: 50,
			costMultiplier: 1.45,
			image: "sibling_incentive.jpg",
		},
		hire_neighborhood_kid: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeMade > 50;
			},
			upgrade: (shop) => {
				(shop as IPreshop).autosellEnabled = true;
			},
			maxLevel: 1,
			cost: 75,
			costMultiplier: 1.5,
			image: "hire_neighborhood_kid.jpg",
		},

		neighborhood_kid_incentive: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("hire_neighborhood_kid") ?? 0) >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).autosellInterval -= 3;
			},
			maxLevel: 4,
			cost: 60,
			costMultiplier: 1.55,
			image: "neighborhood_kid_incentive.jpg",
		},
		efficient_grinding: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("crank_grinder") ?? 0) >= 2 &&
					(shop as IPreshop).lifetimeGrindBeans > 50;
			},
			upgrade: (shop) => {
				(shop as IPreshop).coffeePerBean += 2;
			},
			maxLevel: 1,
			cost: 100,
			costMultiplier: 1.7,
			image: "coffee_grind_catcher.jpg",
		},

		lingering_appeal: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeSold > 50 &&
					shop.upgrades.get("promotional_posters")! >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).appealDecay *= 0.95;
			},
			maxLevel: 3,
			cost: 100,
			costMultiplier: 1.5,
			image: "lingering_appeal.jpg",
		},

		multi_grinder: {
			unlock_condition: (shop) => {
				return (shop.upgrades.get("efficient_grinding") ?? 0) >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).grindQuantity += 1;
			},
			maxLevel: 2,
			cost: 22,
			costMultiplier: 1.2,
			image: "multi_grinder.jpg",
		},

		bulk_bean_deal: {
			unlock_condition: (shop) => {
				let level = shop.upgrades.get("bulk_bean_deal") ?? 0;
				let condition = [70, 200, 400];
				return (shop as IPreshop).lifetimeGrindBeans >= condition[level];
			},
			upgrade: (shop) => {
				let level = (shop as IPreshop).upgrades.get("bulk_bean_deal") ?? 0;
				let beanPrice = [10.99, 17.99, 35.99];
				let beanAmount = [10, 20, 40];
				(shop as IPreshop).beanPrice = beanPrice[level];
				(shop as IPreshop).beansPerBuy = beanAmount[level];
			},
			maxLevel: 3,
			cost: 25,
			costMultiplier: 2,
			image: "bulk_bean_deal.jpg",
		},

		automatic_coffee_refiller: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeMade > 40 &&
					(shop.upgrades.get("makeshift_coffee_refiller") ?? 0) >= 1;
			},
			upgrade: (shop) => {
				(shop as IPreshop).makeCoffeeBatches += 2;
			},
			maxLevel: 3,
			cost: 80,
			costMultiplier: 1.3,
			image: "automatic_coffee_refiller.jpg",
		},

		preshop_nicer_coffee: {
			unlock_condition: (shop) => {
				let thresholds = [20, 30, 50, 80, 100, 150, 170, 200, 220, 250];
				let level = shop.upgrades.get("nicer_coffee") ?? 0;
				return (shop as IPreshop).lifetimeCoffeeSold >= thresholds[level];
			},
			upgrade: (shop) => {
				(shop as IPreshop).coffeePrice += 0.35;
			},
			maxLevel: 10,
			cost: 20,
			costMultiplier: 1.23,
			image: "better_coffee.jpg",
		},

		express_coffee_maker: {
			unlock_condition: (shop) => {
				return (shop as IPreshop).lifetimeCoffeeMade >= 15 &&
					(shop.upgrades.get("deluxe_coffee_pot") ?? 0) >= 3;
			},
			upgrade: (shop) => {
				(shop as IPreshop).makeCoffeeCooldown -= 3500;
			},
			maxLevel: 1,
			cost: 140,
			costMultiplier: 1.2,
			image: "express_coffee_maker.jpg",
		},
	},

	localShop: {
		// play_tester_mode: {
		// 	unlock_condition: (_shop) => {
		// 		return true;
		// 	},
		// 	upgrade: (shop) => {
		// 		shop.moneyMultiplier = playtesterMultiplier;
		// 	},
		// 	maxLevel: 1,
		// 	cost: 0,
		// 	costMultiplier: 1,
		// 	image: "play_tester_mode.jpg",
		// },
		unlock_multishop: {
			unlock_condition: (shop) => {
				// return true;
				if ((shop as ILocalShop).multiShopUnlocked) return false;
				return (shop as ILocalShop).lifetimeStats.coffeeMade >= 100;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).multiShopUnlocked = true;
			},
			maxLevel: 1,
			cost: 200,
			costMultiplier: 1,
			image: "unlock_multishop.jpg",
			flags: ["yellow"],
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
			cost: 100,
			costMultiplier: 1,
			image: "flashy_sign.jpg",
		},
		window_flowers: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 130 && shop.upgrades.has("flashy_sign");
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
			image: "flashy_sign.jpg",
		},
		bumpin_music: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 170 && shop.upgrades.has("window_flowers");
			},
			upgrade: (shop, level) => {
				let statLevels = [0.1, 0.15, 0.18];
				(shop as ILocalShop).minAppeal! += statLevels[level];
				(shop as ILocalShop).appealDecay *= 0.97;
				if ((shop as ILocalShop).appeal < (shop as ILocalShop).minAppeal!) {
					(shop as ILocalShop).appeal = (shop as ILocalShop).minAppeal!;
				}
				(shop as ILocalShop).workerStats.serverCumulativeProductivity! += 0.15;
			},
			maxLevel: 1,
			cost: 150,
			costMultiplier: 1.2,
			image: "flashy_sign.jpg",
		},
		drug_the_coffee: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 170 && shop.upgrades.has("bumpin_music");
			},
			upgrade: (shop, level) => {
				let statLevels = [0.1, 0.15, 0.18];
				(shop as ILocalShop).minAppeal! += statLevels[level];
				(shop as ILocalShop).appealDecay *= 0.97;
				if ((shop as ILocalShop).appeal < (shop as ILocalShop).minAppeal!) {
					(shop as ILocalShop).appeal = (shop as ILocalShop).minAppeal!;
				}
				(shop as ILocalShop).workerStats.serverCumulativeProductivity! += 0.15;
			},
			maxLevel: 1,
			cost: 200,
			costMultiplier: 1.2,
			image: "flashy_sign.jpg",
		},

		expand_cashier_counter: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 70;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerAmounts["serverMax"] += 1;
			},
			maxLevel: 3,
			cost: 100,
			costMultiplier: 1.5,
			image: "expand_cashier_counter.jpg",
		},
		additional_promotion_materials: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).promoterUnlocked;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerAmounts["promoterMax"] += 1;
			},
			maxLevel: 3,
			cost: 100,
			costMultiplier: 1.5,
			image: "additional_promotion_materials.jpg",
		},
		expand_coffee_bar: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeMade >= 200;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerAmounts["baristaMax"] += 1;
			},
			maxLevel: 3,
			cost: 100,
			costMultiplier: 1.5,
			image: "expand_coffee_bar.jpg",
		},
		upgrade_cash_register: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 10;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.serverFlatProductivity! += 0.1;
			},
			maxLevel: 1,
			cost: 60,
			costMultiplier: 1.15,
			image: "upgrade_cash_register.jpg",
		},
		increase_customer_flow: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeSold >= 40;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.serverCumulativeProductivity! += 0.15;
			},
			maxLevel: 5,
			cost: 50,
			costMultiplier: 1.2,
			image: "increase_customer_flow.jpg",
		},
		better_coffee_machine: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeMade >= 70;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.baristaCumulativeProductivity! += 0.05;
				(shop as ILocalShop).workerStats.baristaFlatProductivity! += 0.03;
			},
			maxLevel: 1,
			cost: 70,
			costMultiplier: 1,
			image: "better_coffee_machine.jpg",
		},
		betterer_coffee_machine: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).upgrades.has("better_coffee_machine");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.baristaCumulativeProductivity! += 0.06;
				(shop as ILocalShop).workerStats.baristaFlatProductivity! += 0.04;

			},
			maxLevel: 1,
			cost: 100,
			costMultiplier: 1,
			image: "better_coffee_machine.jpg",
		},
		super_coffee_machine: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).upgrades.has("betterer_coffee_machine");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.baristaCumulativeProductivity! += 0.06;
				(shop as ILocalShop).workerStats.baristaFlatProductivity! += 0.04;

			},
			maxLevel: 1,
			cost: 120,
			costMultiplier: 1,
			image: "better_coffee_machine.jpg",
		},
		super_duper_coffee_machine: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).upgrades.has("super_coffee_machine");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.baristaCumulativeProductivity! += 0.06;
				(shop as ILocalShop).workerStats.baristaFlatProductivity! += 0.04;

			},
			maxLevel: 1,
			cost: 150,
			costMultiplier: 1,
			image: "better_coffee_machine.jpg",
		},
		ultra_coffee_machine: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).upgrades.has("super_duper_coffee_machine");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.baristaCumulativeProductivity! += 0.06;
				(shop as ILocalShop).workerStats.baristaFlatProductivity! += 0.04;

			},
			maxLevel: 1,
			cost: 200,
			costMultiplier: 1,
			image: "better_coffee_machine.jpg",
		},
		giga_coffee_machine: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).upgrades.has("ultra_coffee_machine");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.baristaCumulativeProductivity! += 0.07;
				(shop as ILocalShop).workerStats.baristaFlatProductivity! += 0.05;

			},
			maxLevel: 1,
			cost: 250,
			costMultiplier: 1,
			image: "better_coffee_machine.jpg",
		},
		ultimate_coffee_machine: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).upgrades.has("giga_coffee_machine");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).workerStats.baristaCumulativeProductivity! += 0.08;
				(shop as ILocalShop).workerStats.baristaFlatProductivity! += 0.06;

			},
			maxLevel: 1,
			cost: 250,
			costMultiplier: 1,
			image: "better_coffee_machine.jpg",
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
			cost: 100,
			costMultiplier: 1.3,
			image: "promoter_effectiveness.jpg",
		},
		local_shop_nicer_coffee: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeMade >=
					50 * (shop.upgrades.get("local_shop_nicer_coffee") ?? 0);
			},
			upgrade: (shop) => {
				(shop as ILocalShop).coffeePrice += 0.35;
			},
			maxLevel: 3,
			cost: 40,
			costMultiplier: 1.23,
			image: "local_shop_nicer_coffee.jpg",
		},
		brazilian_beans: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeMade >=
					150 && ((shop.upgrades.get("local_shop_nicer_coffee") ?? 0) >= 3);
			},
			upgrade: (shop) => {
				(shop as ILocalShop).coffeePrice += 0.5;
			},
			maxLevel: 1,
			cost: 150,
			costMultiplier: 1,
			image: "local_shop_nicer_coffee.jpg",
		},
		civet_coffee: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.coffeeMade >=
					200 && shop.upgrades.has("brazilian_beans");
			},
			upgrade: (shop) => {
				(shop as ILocalShop).coffeePrice += 0.8;
			},
			maxLevel: 1,
			cost: 200,
			costMultiplier: 1,
			image: "local_shop_nicer_coffee.jpg",
		},

		unlock_auto_restock: {
			unlock_condition: (shop) => {
				return (shop as ILocalShop).lifetimeStats.totalRestocked >= 100;
			},
			upgrade: (shop) => {
				(shop as ILocalShop).unlockAutoRestock();
			},
			maxLevel: 1,
			cost: 200,
			costMultiplier: 1,
			image: "local_shop_nicer_coffee.jpg", //replace with correct image !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		},
	},

	multiShop: {
		establish_franchise: {
			unlock_condition: (multishop) => {
				return true;
			},
			upgrade: (shop) => {
				(shop as IScene).endScene();
			},
			maxLevel: 1,
			cost: 5000,
			costMultiplier: 1,
			image: "establish_franchise.jpg",
		},
		// apply to children style upgrades have the associated flag. their upgrade function applies to the LOCAL shops
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
			image: "cohesive_branding.jpg",
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
			image: "unlock_promoter.jpg",
		},
		add_new_shop: {
			unlock_condition: (multishop) => {
				return true;
			},
			upgrade: (shop) => {
				(shop as IContainerShop).addShop();
			},
			maxLevel: 6,
			cost: 1000,
			costMultiplier: 1.5,
			image: "add_new_shop.jpg",
		},
	},
};
