// will have diff upgrade manager for each subset (preshop, shop, etc)
export class UpgradeManager {
	// updgrades of a specific subset (preshop, shop, etc)
	allUpgrades: { [key: string]: IUpgrade };

	constructor(subset: string) {
		this.allUpgrades = upgradeJSON[subset];
	}

	applyUpgrade(id: string, shopObject: IShop) {
		// if multishop style
		if (this.allUpgrades[id].flags?.includes("applyToChildren")) {
			shopObject.shops!.forEach((shop: IShop) => {
				this.allUpgrades[id].upgrade(shop, shop.upgrades.get(id) ?? 1);
			});
		} else {
			// if single shop style
			this.allUpgrades[id].upgrade(
				shopObject,
				shopObject.upgrades.get(id) ?? 1,
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
//  way to designate upgrade caps and single upgrades
export let upgradeJSON: { [key: string]: { [key: string]: IUpgrade } } = {
	preshop: {
		play_tester_mode: {
			unlock_condition: (_shop) => {
				return true;
			},
			upgrade: (shop) => {
				shop.moneyMultiplier = 2.3;
			},
			maxLevel: 1,
			cost: 0,
			costMultiplier: 1,
			image: "play_tester_mode.jpg",
		},
		crank_grinder: {
			unlock_condition: (_shop) => {
				let level = _shop.upgrades.get("crank_grinder") ?? 0;
				let condition = [2, 10];
				return _shop.lifetimeGrindBeans > 2;
			},
			upgrade: (shop) => {
				shop.grindTime -= 2;
			},
			maxLevel: 2,
			cost: 8,
			costMultiplier: 2.5,
			image: "crank_grinder.jpg",
		},

		deluxe_coffee_pot: {
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeMade > 8;
			},
			upgrade: (shop) => {
				shop.makeCoffeeQuantity! += 3;
				shop.makeCoffeeCooldown += 1000;
			},
			maxLevel: 3,
			cost: 13,
			costMultiplier: 1.15,
			image: "deluxe_coffee_pot.jpg",
		},

		word_of_mouth: {
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeSold >= 20;
			},
			upgrade: (shop) => {
				shop.minAppeal! += 0.05;
			},
			maxLevel: 1,
			cost: 0,
			costMultiplier: 1,
			image: "word_of_mouth.jpg",
		},

		promotional_posters: {
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeSold >= 10 && _shop.upgrades.get("word_of_mouth")! >= 1;
			},
			upgrade: (shop) => {
				shop.promotionEffectiveness += 0.08;
				shop.minAppeal! += 0.05;
				shop.maxAppeal! += 0.1;
				shop.maxCustomers! += 1;
			},
			maxLevel: 3,
			cost: 30,
			costMultiplier: 1.3,
			image: "promotional_posters.jpg",
		},

		makeshift_coffee_refiller: {
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeMade > 15;
			},
			upgrade: (shop) => {
				shop.makeCoffeeBatches += 1;
			},
			maxLevel: 1,
			cost: 30,
			costMultiplier: 1,
			image: "automatic_coffee_refiller.jpg",
		},

		enlist_younger_sibling: {
			unlock_condition: (_shop) => {
				return (_shop.upgrades.get("crank_grinder") ?? 0) >= 2 && _shop.lifetimeGrindBeans > 20;
			},
			upgrade: (shop) => {
				shop.autogrindingEnabled = true;
			},
			maxLevel: 1,
			cost: 50,
			costMultiplier: 1,
			image: "enlist_sibling.jpg",
		},

		efficient_grinding: {
			unlock_condition: (_shop) => {
				return (_shop.upgrades.get("crank_grinder") ?? 0) >= 2 && _shop.lifetimeGrindBeans > 50;
			},
			upgrade: (shop) => {
				shop.coffeePerBean += 2;
			},
			maxLevel: 1,
			cost: 100,
			costMultiplier: 1.7,
			image: "coffee_grind_catcher.jpg",
		},

		multi_grinder: {
			unlock_condition: (_shop) => {
				return (_shop.upgrades.get("efficient_grinding") ?? 0) >= 1;
			},
			upgrade: (shop) => {
				shop.grindQuantity += 1;
			},
			maxLevel: 2,
			cost: 22,
			costMultiplier: 1.2,
			image: "multi_grinder.jpg",
		},

		bulk_bean_deal: {
			unlock_condition: (_shop) => {
				let level = _shop.upgrades.get("bulk_bean_deal") ?? 0;
				let condition = [70, 200, 400];
				return _shop.lifetimeGrindBeans >= condition[level];
			},
			upgrade: (shop) => {
				let level = shop.upgrades.get("bulk_bean_deal") ?? 0;
				let beanPrice = [17.99, 35.99, 69.99];
				let beanAmount = [10, 20, 40];
				shop.beanPrice = beanPrice[level];
				shop.beansPerBuy = beanAmount[level];
			},
			maxLevel: 3,
			cost: 25,
			costMultiplier: 2,
			image: "bulk_bean_deal.jpg",
		},

		automatic_coffee_refiller: {
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeMade > 40 && (_shop.upgrades.get("makeshift_coffee_refiller") ?? 0) >= 1;
			},
			upgrade: (shop) => {
				shop.makeCoffeeBatches += 2;
			},
			maxLevel: 3,
			cost: 100,
			costMultiplier: 1.3,
			image: "automatic_coffee_refiller.jpg",
		},

		hire_neighborhood_kid: {
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeMade > 50;
			},
			upgrade: (shop) => {
				shop.autosellEnabled = true;
			},
			maxLevel: 1,
			cost: 200,
			costMultiplier: 1.5,
			image: "hire_neighborhood_kid.jpg",
		},

		nicer_coffee: {
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeSold > 20;
			},
			upgrade: (shop) => {
				shop.coffeePrice += 0.7;
			},
			maxLevel: 10,
			cost: 20,
			costMultiplier: 1.23,
			image: "better_coffee.jpg",
		},

		express_coffee_maker: {
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeMade >= 15 && (_shop.upgrades.get("deluxe_coffee_pot") ?? 0) >= 3;
			},
			upgrade: (shop) => {
				shop.makeCoffeeCooldown -= 3500;
			},
			maxLevel: 1,
			cost: 140,
			costMultiplier: 1.2,
			image: "express_coffee_maker.jpg",
		},

		buy_coffee_shop: {
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeSold >= 125;
			},
			upgrade: (shop) => {
				shop.endScene();
			},
			maxLevel: 1,
			cost: 1000,
			costMultiplier: 1,
			image: "buy_coffee_shop.jpg",
		},
	},

	localShop: {
		flashy_sign: {
			unlock_condition: (_shop) => {
				return true;
			},
			upgrade: (shop, level) => {
				let statLevels = [0, 1, 0.5, 0.5];
				shop.minAppeal! += statLevels[level];
				shop.appealDecay *= 0.97;
				if (shop.appeal < shop.minAppeal!) {
					shop.appeal = shop.minAppeal!;
				}
			},
			maxLevel: 3,
			cost: 300,
			costMultiplier: 1.2,
			image: "flashy_sign.jpg",
		},
	},

	multiShop: {
		cohesive_branding: {
			unlock_condition: (multishop) => {
				return multishop.shops!.length > 1; // maybe change to 2 later
			},
			upgrade: (shop) => {
				shop.minAppeal! += 0.2;
				shop.promotionEffectiveness += 0.1;
			},
			flags: ["applyToChildren"],
			maxLevel: undefined,
			cost: 1000,
			costMultiplier: 1.5,
			image: "cohesive_branding.jpg",
		},
	},
};
