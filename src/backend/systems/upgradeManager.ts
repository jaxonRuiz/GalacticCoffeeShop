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
		crank_grinder: {
			name: "Crank Grinder",
			description: "Make bean grinding process easier",
			unlock_condition: (_shop) => {
				return true;
			},
			upgrade: (shop) => {
				shop.grindTime -= 2;
			},
			maxLevel: 2,
			cost: 8,
			costMultiplier: 1.5,
			image: "crank_grinder.jpg",
		},

		deluxe_coffee_pot: {
			name: "Deluxe Coffee Pot",
			description:
				"Make more sellable coffee at once, at the cost of longer time to make",
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeMade > 0;
			},
			upgrade: (shop) => {
				shop.coffeeQuantity! += 0.5;
				shop.makeCoffeeCooldown += 500;
			},
			maxLevel: 3,
			cost: 13,
			costMultiplier: 1.15,
			image: "deluxe_coffee_pot.jpg",
		},
		efficient_grinding: {
			name: "Bean Grinding Efficiency",
			description: "Extract more coffee per bean",
			unlock_condition: (_shop) => {
				return (_shop.upgrades.get("crank_grinder") ?? 0) >= 1;
			},
			upgrade: (shop) => {
				shop.coffeePerBean += 0.5;
			},
			maxLevel: 3,
			cost: 15,
			costMultiplier: 1.7,
			image: "coffee_grind_catcher.jpg",
		},
		multi_grinder: {
			name: "Multi Grinder",
			description: "Grind multiple beans at once!",
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
			name: "Bulk Bean Deal",
			description:
				"Arrange for a better bulk bean buying deal. Purchase more beans at once for a bulk discount",
			unlock_condition: (_shop) => {
				let level = _shop.upgrades.get("bulk_bean_deal") ?? 0;
				let condition = [5, 10, 20, 40];
				return _shop.lifetimeGrindBeans >= condition[level];
			},
			upgrade: (shop) => {
				let level = shop.upgrades.get("bulk_bean_deal") ?? 0;
				let beanPrice = [8.99, 17.99, 35.99, 69.99];
				let beanAmount = [5, 10, 20, 40];
				shop.beanPrice = beanPrice[level];
				shop.beansPerBuy = beanAmount[level];
			},
			maxLevel: 4,
			cost: 25,
			costMultiplier: 2,
			image: "bulk_bean_deal.jpg",
		},
		stand_sign: {
			name: "Stand Sign",
			description:
				"Invest in a sigh for your coffee stand. Passively draw customer interest, and increase maximum appeal!",
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeSold >= 20;
			},
			upgrade: (shop) => {
				let level = shop.upgrades.get("stand_sign") ?? 0;
				let minAppeal = [0.1, 0.2, 0.3];
				shop.minAppeal = minAppeal[level];
				shop.maxAppeal! += 0.2;
			},
			maxLevel: 3,
			cost: 60,
			costMultiplier: 1.5,
			image: "stand_sign.jpg",
		},
		promotional_posters: {
			name: "Promotional Posters",
			description:
				"Attract more customers per promotion with promotional posters",
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeSold >= 5;
			},
			upgrade: (shop) => {
				shop.promotionEffectiveness += 0.08;
			},
			maxLevel: 3,
			cost: 30,
			costMultiplier: 1.3,
			image: "promotional_posters.jpg",
		},
		express_coffee_maker: {
			name: "Express Coffee Maker",
			description: "Speed up the production time of coffee",
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeMade >= 15;
			},
			upgrade: (shop) => {
				shop.makeCoffeeCooldown -= 500;
			},
			maxLevel: 3,
			cost: 40,
			costMultiplier: 1.2,
			image: "express_coffee_maker.jpg",
		},
		additional_coffee_drips: {
			name: "Additional Coffee Drips",
			description:
				"Make more cups of sellable coffee per session, without increasing production time",
			unlock_condition: (_shop) => {
				return _shop.lifetimeCoffeeSold >= 25;
			},
			upgrade: (shop) => {
				shop.coffeeQuantity! += 1;
			},
			maxLevel: 2,
			cost: 100,
			costMultiplier: 1.3,
			image: "additional_coffee_drips.jpg",
		},

		buy_coffee_shop: {
			name: "Buy Coffee Shop",
			description:
				"Rent land to start a proper coffee shop! Open new managerial options and coffee creation options!",
			unlock_condition: (_shop) => {
				return true;
			},
			upgrade: (shop) => {
				shop.endScene();
			},
			maxLevel: 1,
			cost: 100,
			costMultiplier: 1,
			image: "buy_coffee_shop.jpg",
		},
	},

	localShop: {
		flashy_sign: {
			name: "Flashy Sign",
			description: "Passively attract more customers to your storefront!",
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
			name: "Cohesive Branding",
			description: "Increase appeal of all shops",
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
