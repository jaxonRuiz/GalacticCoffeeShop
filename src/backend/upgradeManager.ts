interface Shop {
  upgrades: Map<string, number>;
}

export class UpgradeManager {
  allUpgrades;

  constructor(allUpgrades) {
    this.allUpgrades = allUpgrades;
  }

  applyUpgrade(id: string, shopObject: Shop) {
    this.allUpgrades[id].upgrade(shopObject, shopObject.upgrades[id]??1);
  }

  // returns all purchasable upgrades at shop
  checkUpgrade(shopObject) {
    // todo
  }
}


export let preshopUpgrades = {
  "crank_grinder": {
    "name": "Crank Grinder",
    "description": "Simplify grinding process! Grind more coffee per grind!",
    "unlock_condition": () => {return true;},
    "upgrade": (shop) => {shop.grindTime -= 2},
    "cost": 50,
    "cost_multiplier": 1,
    "image": "crank_grinder.jpg"
  }
}