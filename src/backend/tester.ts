import { Preshop } from "./classes/preshop";
import { UpgradeManager } from "./systems/upgradeManager";
import { Timer } from "./systems/time";

export class Tester {
	constructor() {
		console.log("Tester created");
	}

	preshopTest01() {
		let timer = new Timer();
		let preshop = new Preshop(timer.timeEvents);

		let preshopManager = new UpgradeManager("preshop");
		// let globalTick = setInterval(tick, 250);
		console.log("starting");

		console.log("testing upgrade");
		console.assert(preshop.grindTime == 5); // or whatever the starting grindTime is
		preshopManager.applyUpgrade("crank_grinder", preshop);
		console.assert(preshop.grindTime == 3);

		console.log("testing grindBeans");
		console.log("beans: ", preshop.beans);
		console.log("groundCoffee: ", preshop.groundCoffee);
		preshop.grindBeans();
		console.log("beans: ", preshop.beans);
		preshop.grindBeans();
		preshop.grindBeans();
		preshop.grindBeans();
		preshop.grindBeans();
		console.log("ground coffee", preshop.groundCoffee);
	}
}
