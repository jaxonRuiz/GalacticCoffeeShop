import { Preshop } from "./preshop";
import { UpgradeManager, preshopUpgrades } from "./upgradeManager";
let preshop = new Preshop();

let preshopManager = new UpgradeManager(preshopUpgrades);
let globalTick = setInterval(tick, 250);
console.log("starting");

console.log(preshop.grindTime);
preshopManager.applyUpgrade("crank_grinder", preshop);
console.log(preshop.grindTime);

function tick() {
  // update preshop
  preshop.tick();
  console.log("tick");
}


