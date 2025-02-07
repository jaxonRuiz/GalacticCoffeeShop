// will have diff upgrade manager for each subset (preshop, shop, etc)
export class UpgradeManager {
  allUpgrades: { [key: string]: Upgrade }; // updgrades of a specific subset (preshop, shop, etc)

  constructor(subset: string) {
    this.allUpgrades = upgradeJSON[subset];
  }

  applyUpgrade(id: string, shopObject: ShopObject) {
    // if multishop style
    if (this.allUpgrades[id].flags?.includes("applyToChildren")) {
      shopObject.shops!.forEach((shop: Shop) => {
        this.allUpgrades[id].upgrade(shop, shop.upgrades.get(id) ?? 1);
      })
    } else { // if single shop style
      this.allUpgrades[id].upgrade(shopObject, shopObject.upgrades.get(id) ?? 1);
      shopObject.applyCost(this.getCost(id, shopObject));
      shopObject.upgrades.set(id, (shopObject.upgrades.get(id) ?? 0) + 1);
    }
  }

  getCost(id: string, shopObject: Shop) {
    if (shopObject.upgrades.get(id) === undefined)
      return this.allUpgrades[id].cost;
    // cost * (costMultiplier ^ level)
    return (
      this.allUpgrades[id].cost *
      Math.pow(
        this.allUpgrades[id].costMultiplier,
        shopObject.upgrades.get(id) ?? 0
      )
    );
  }

  // returns all purchasable upgrades (AS ID KEYS) at shop
  checkUpgrade(shopObject: ShopObject) {
    let unpurchasedUpgrades = Object.keys(this.allUpgrades).filter(
      (id: string) => {
        if (this.allUpgrades[id].maxLevel === undefined) return true;
        else if (
          (shopObject.upgrades.get(id) ?? 0) < this.allUpgrades[id].maxLevel
        )
          return true;
        return false;
      }
    );

    return unpurchasedUpgrades.filter((id: string) => {
      return this.allUpgrades[id].unlock_condition(shopObject);
    });
  }
}

// need to have a
//  way to designate upgrade caps and single upgrades
export let upgradeJSON: { [key: string]: { [key: string]: Upgrade } } = {
  preshop: {
    crank_grinder: {
      name: "Crank Grinder",
      description: "Simplify grinding process! Grind more coffee per grind!",
      unlock_condition: (_shop) => {
        return true;
      },
      upgrade: (shop) => {
        shop.grindTime -= 2;
      },
      maxLevel: 1,
      cost: 8,
      costMultiplier: 1,
      image: "crank_grinder.jpg",
    },
    deluxe_coffee_pot: {
      name: "Deluxe Coffee Pot",
      description: "Increase coffee quantity",
      unlock_condition: (_shop) => {
        return true;
      },
      upgrade: (shop) => {
        shop.coffeeQuantity += 1;
      },
      maxLevel: 3,
      cost: 13,
      costMultiplier: 1.15,
      image: "deluxe_coffee_pot.jpg",
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
        shop.minimumAppeal += statLevels[level];
        shop.appealDecay *= 0.97;
        if (shop.appeal < shop.minimumAppeal) shop.appeal = shop.minimumAppeal;

      },
      maxLevel: 3,
      cost: 300,
      costMultiplier: 1.2,
      image: "flashy_sign.jpg",
    }
  },

  multiShop: {
    cohesive_branding: {
      name: "Cohesive Branding",
      description: "Increase appeal of all shops",
      unlock_condition: (multishop) => {
        return multishop.shops!.length > 1; // maybe change to 2 later
      },
      upgrade: (shop) => {
        shop.minimumAppeal += 0.2;
        shop.promotionEffectiveness += 0.1;
      },
      flags: ["applyToChildren"],
      maxLevel: undefined,
      cost: 1000,
      costMultiplier: 1.5,
      image: "cohesive_branding.jpg",
    }
  }
};
