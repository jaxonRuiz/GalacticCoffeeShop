// will have diff upgrade manager for each subset (preshop, shop, etc)
export class UpgradeManager {
  allUpgrades: { [key: string]: Upgrade }; // updgrades of a specific subset (preshop, shop, etc)

  constructor(subset: string) {
    this.allUpgrades = upgradeJSON[subset];
  }

  applyUpgrade(id: string, shopObject: Shop) {
    this.allUpgrades[id].upgrade(shopObject, shopObject.upgrades.get(id) ?? 1);
    shopObject.applyCost(this.getCost(id, shopObject));
    shopObject.upgrades.set(id, (shopObject.upgrades.get(id) ?? 0) + 1);
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
  checkUpgrade(shopObject: Shop) {
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

interface Upgrade {
  name: string;
  description: string;
  unlock_condition: (shop: Shop) => boolean;
  upgrade: (shop: Shop, level: number) => void;
  maxLevel: number | undefined; // undefined means infinite upgrade
  cost: number;
  costMultiplier: number;
  image: string;
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
};
