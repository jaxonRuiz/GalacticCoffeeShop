let sessionStartTime = 0;
let preshopEndTime = 0;
let multishopEndTime = 0;
let franchiseEndTime = 0;

let coffeesMade = 0;
let preshopCoffeesMade = 0;
let multishopCoffeesMade = 0;
let franchiseCoffeesMade = 0;

let moneyMade = 0;
let preshopMoneyMade = 0;
let multishopMoneyMade = 0;
let franchiseMoneyMade = 0;

export function startSession() {
	sessionStartTime = Date.now();
}

export function endSession() {
	// DOESNT WORK BC THE QUEUE DOESNT GET CLEARED AT THE END :(
	const totalTime = (Date.now() - sessionStartTime) / 1000;

	window.gameanalytics.GameAnalytics.addDesignEvent("timer:total", totalTime);
	window.gameanalytics.GameAnalytics.addDesignEvent("coffeePerMinute:total", coffeesMade / (totalTime / 60));
	window.gameanalytics.GameAnalytics.addDesignEvent("moneyPerMinute:total", moneyMade / (totalTime / 60));
}

export function preshopDone() {
	preshopEndTime = Date.now();
	preshopCoffeesMade = coffeesMade;
	preshopMoneyMade = moneyMade;

	const preTime = (preshopEndTime - sessionStartTime) / 1000;
	const preCoffee = preshopCoffeesMade;
	const preMoney = preshopMoneyMade;

	window.gameanalytics.GameAnalytics.addDesignEvent("timer:preshop", preTime);
	window.gameanalytics.GameAnalytics.addDesignEvent("coffeePerMinute:preshop", preCoffee / (preTime / 60));
	window.gameanalytics.GameAnalytics.addDesignEvent("moneyPerMinute:preshop", preMoney / (preTime / 60));
}

export function multishopDone() {
	multishopEndTime = Date.now();
	multishopCoffeesMade = coffeesMade;
	multishopMoneyMade = moneyMade;

	const multiTime = (multishopEndTime - Math.max(preshopEndTime, sessionStartTime)) / 1000;
	const multiCoffee = multishopCoffeesMade - preshopCoffeesMade;
	const multiMoney = multishopMoneyMade - preshopMoneyMade;

	window.gameanalytics.GameAnalytics.addDesignEvent("timer:multishop", multiTime);
	window.gameanalytics.GameAnalytics.addDesignEvent("coffeePerMinute:multishop", multiCoffee / (multiTime / 60));
	window.gameanalytics.GameAnalytics.addDesignEvent("moneyPerMinute:multishop", multiMoney / (multiTime / 60));
}

export function franchiseDone() {
	franchiseEndTime = Date.now();
	franchiseCoffeesMade = coffeesMade;
	franchiseMoneyMade = moneyMade;

	const franchTime = (franchiseEndTime - Math.max(multishopEndTime, sessionStartTime)) / 1000;
	const franchCoffee = franchiseCoffeesMade - multishopCoffeesMade;
	const franchMoney = franchiseMoneyMade - multishopMoneyMade;

	window.gameanalytics.GameAnalytics.addDesignEvent("timer:franchise", franchTime);
	window.gameanalytics.GameAnalytics.addDesignEvent("coffeePerMinute:franchise", franchCoffee / (franchTime / 60));
	window.gameanalytics.GameAnalytics.addDesignEvent("moneyPerMinute:franchise", franchMoney / (franchTime / 60));
}

let money1k = false;
let money10k = false;
export function addMoney(amount: number) {
	moneyMade += amount;
    if (moneyMade >= 1000 && !money1k) {
        window.gameanalytics.GameAnalytics.addDesignEvent("progress:money:thousand", (Date.now() - sessionStartTime) / 1000);
        money1k = true;
    }
    if (moneyMade >= 10000 && !money10k) {
        window.gameanalytics.GameAnalytics.addDesignEvent("progress:money:tenthousand", (Date.now() - sessionStartTime) / 1000);
        money10k = true;
    }
}

let coffee100 = false;
let coffee1k = false
export function addCoffee(amount: number) {
	coffeesMade += amount;
    if (coffeesMade >= 100 && !coffee100) {
        window.gameanalytics.GameAnalytics.addDesignEvent("progress:coffee:hundred", (Date.now() - sessionStartTime) / 1000);
        coffee100 = true;
    }
    if (coffeesMade >= 1000 && !coffee1k) {
        window.gameanalytics.GameAnalytics.addDesignEvent("progress:money:thousand", (Date.now() - sessionStartTime) / 1000);
        coffee1k = true;
    }
}

// let sessionStartTime = 0;
// let preshopEndTime = 0;
// let multishopEndTime = 0;
// let franchiseEndTime = 0;
// let coffeesMade = 0;
// let preshopCoffeesMade = 0;
// let multishopCoffeesMade = 0;
// let franchiseCoffeesMade = 0;
// let moneyMade = 0;
// let preshopMoneyMade = 0;
// let multishopMoneyMade = 0;
// let franchiseMoneyMade = 0;

// export function startSession() {
//     sessionStartTime = Date.now();
// }

// export function endSession() {
//     sendAnalytics();
// }

// export function preshopDone()  {
//     preshopEndTime = Date.now();
//     preshopCoffeesMade = coffeesMade;
//     preshopMoneyMade = moneyMade;
// }

// export function multishopDone() {
//     multishopEndTime = Date.now();
//     multishopCoffeesMade = coffeesMade;
//     multishopMoneyMade = moneyMade;
// }

// export function franchiseDone() {
//     franchiseEndTime = Date.now();
//     franchiseCoffeesMade = coffeesMade;
//     franchiseMoneyMade = moneyMade;
// }

// export function addMoney(amount: number) {
//     moneyMade += amount;
// }

// export function addCoffee(amount: number) {
//     coffeesMade += amount;
// }

// function sendAnalytics() {
//     const preTime = (preshopEndTime - sessionStartTime)/1000;
//     const multiTime = (multishopEndTime - Math.max(preshopEndTime, sessionStartTime))/1000;
//     const franchTime = (franchiseEndTime - Math.max(multishopEndTime, sessionStartTime))/1000;
//     window.gameanalytics.GameAnalytics.addDesignEvent("timer:total", (Date.now() - sessionStartTime)/1000);
//     if (preshopEndTime > 0) window.gameanalytics.GameAnalytics.addDesignEvent("timer:preshop", preTime);
//     if (multishopEndTime > 0) window.gameanalytics.GameAnalytics.addDesignEvent("timer:multishop", multiTime);
//     if (franchiseEndTime > 0) window.gameanalytics.GameAnalytics.addDesignEvent("timer:franchise", franchTime);

//     const preCoffee = preshopCoffeesMade;
//     const multiCoffee = multishopCoffeesMade - preshopCoffeesMade;
//     const franchCoffee = franchiseCoffeesMade - multishopCoffeesMade;
//     window.gameanalytics.GameAnalytics.addDesignEvent("coffeePerMinute:total", coffeesMade/(Date.now() - sessionStartTime)/1000/60)
//     if (preshopCoffeesMade > 0) window.gameanalytics.GameAnalytics.addDesignEvent("coffeePerMinute:preshop", preCoffee/preTime/60);
//     if (multishopCoffeesMade > 0) window.gameanalytics.GameAnalytics.addDesignEvent("coffeePerMinute:multishop", multiCoffee/multiTime/60);
//     if (franchiseCoffeesMade > 0) window.gameanalytics.GameAnalytics.addDesignEvent("coffeePerMinute:franchise", franchCoffee/franchTime/60);

//     const preMoney = preshopMoneyMade;
//     const multiMoney = multishopMoneyMade - preshopMoneyMade;
//     const franchMoney = franchiseMoneyMade - multishopMoneyMade;
//     window.gameanalytics.GameAnalytics.addDesignEvent("moneyPerMinute:total", moneyMade/(Date.now() - sessionStartTime)/1000/60)
//     if (preshopMoneyMade > 0) window.gameanalytics.GameAnalytics.addDesignEvent("moneyPerMinute:preshop", preMoney/preTime/60);
//     if (multishopMoneyMade > 0) window.gameanalytics.GameAnalytics.addDesignEvent("moneyPerMinute:multishop", multiMoney/multiTime/60);
//     if (franchiseMoneyMade > 0) window.gameanalytics.GameAnalytics.addDesignEvent("moneyPerMinute:franchise", franchMoney/franchTime/60);
// }