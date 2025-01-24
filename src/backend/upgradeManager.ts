interface Shop {
  upgrades: Map<string, number>;
}

export class UpgradeManager {
  allUpgrades;

  constructor(subset: string) {
    this.allUpgrades = upgradeJSON[subset];
  }

  applyUpgrade(id: string, shopObject: Shop) {
    this.allUpgrades[id].upgrade(shopObject, shopObject.upgrades[id] ?? 1);
  }

  // returns all purchasable upgrades at shop
  checkUpgrade(shopObject) {
    // todo
  }
}


let upgradeJSON: { [key: string] : any} = {
  preshop: {
    "crank_grinder": {
      "name": "Crank Grinder",
      "description": "Simplify grinding process! Grind more coffee per grind!",
      "unlock_condition": (shop) => { return true; },
      "upgrade": (shop) => { shop.grindTime -= 2 },
      "cost": 50,
      "cost_multiplier": 1,
      "image": "crank_grinder.jpg"
    }
  }
}