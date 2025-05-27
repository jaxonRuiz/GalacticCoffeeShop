import { get, type Writable, writable } from "svelte/store";
import { Publisher } from "../systems/observer";
import { msPerTick } from "../systems/time";
import { AudioManager, cleanupAudioManagers } from "../systems/audioManager";
import { aud } from "../../assets/aud";
import { UIManager } from "../interface/uimanager";
import { addCoffee, addMoney } from "../analytics";

export class Preshop implements ISubscriber, IScene, IPreshop {
	moneyMultiplier: number = 1;

	// resources (setting writable to interact with svelte)
	// not to be used in backend
	w_money: Writable<number> = writable(20);
	w_beans: Writable<number> = writable(20);
	w_groundCoffee: Writable<number> = writable(0);
	w_coffeeCups: Writable<number> = writable(0);
	w_waitingCustomers: Writable<number> = writable(0);
	w_appeal: Writable<number> = writable(0);
	w_beanPrice: Writable<number> = writable(3);
	w_grindProgress: Writable<number> = writable(-1); // -1 means not grinding
	w_canMakeCoffee: Writable<boolean> = writable(true);
	w_makeCoffeeTime: Writable<number> = writable(0);
	w_makeCoffeeCount: Writable<number> = writable(0);
	w_beansPerBuy: Writable<number> = writable(5);
	w_coffeePrice: Writable<number> = writable(6);
	w_maxCoffeeCups: Writable<number> = writable(36);
	w_maxCustomers: Writable<number> = writable(5);
	w_makeCoffeeMaxBatches: Writable<number> = writable(1); // how many cups of coffee are made per run
	w_makeCoffeeCooldown: Writable<number> = writable(7000); // cooldown for making coffee IN MILLISECONDS

	// internal stats
	coffeePerBean: number = 0.5;
	grindQuantity: number = 1; // how many beans are ground at a time
	grindTime: number = 9; // number of times to click to grind a bean
	customerProgress: number = 0; // progress to next customer
	promotionEffectiveness: number = 0.05; // current rate of customer generation
	appealDecay: number = 0.35; // rate of decay of customer appeal
	maxAppeal: number = 0.5;
	minAppeal: number = 0; // minimum appeal (after decay)
	makeCoffeeQuantity: number = 3; // how many cups of coffee are made per run
	runTutorial: boolean = true;
	customerPatienceCount: number = 0;
	customerPatienceAmount: number = 7; // how long customers wait before leaving

	autogrindingEnabled: boolean = false; // whether or not to grind automatically
	autogrindInterval: number = 4;
	autogrindCounter: number = 0;

	autosellEnabled: boolean = false; // whether or not to sell automatically
	autosellInterval: number = 8;
	autosellCounter: number = 0;

	// stat counters
	w_lifetimeGrindBeans: Writable<number> = writable(0);
	w_lifetimeCoffeeSold: Writable<number> = writable(0);
	w_lifetimeCoffeeMade: Writable<number> = writable(0);

	// contains list of upgrades (IDs) and their levels
	upgrades: Map<string, number> = new Map();

	sceneManager: Publisher;
	audioManager: AudioManager = new AudioManager();
	lastPlayedMeow: string | null = null;
	uiManager: UIManager;

	// abstracting svelte store from normal usage (allows use of writables in backend)
	// resources
	get money() {
		return get(this.w_money);
	}
	set money(value) {
		this.w_money.set(value);
	}
	get beans() {
		return get(this.w_beans);
	}
	set beans(value) {
		this.w_beans.set(value);
	}
	get groundCoffee() {
		return get(this.w_groundCoffee);
	}
	set groundCoffee(value) {
		this.w_groundCoffee.set(value);
	}
	get coffeeCups() {
		return get(this.w_coffeeCups);
	}
	set coffeeCups(value) {
		this.w_coffeeCups.set(value);
		this.uiManager.setCoffeeCount(value);
	}
	get waitingCustomers() {
		return get(this.w_waitingCustomers);
	}
	set waitingCustomers(value) {
		this.w_waitingCustomers.set(value);
		this.uiManager.setCustomerCount(value);
	}

	// stats
	get appeal() {
		return get(this.w_appeal);
	}
	set appeal(value) {
		this.w_appeal.set(value);
	}
	get beanPrice() {
		return get(this.w_beanPrice);
	}
	set beanPrice(value) {
		this.w_beanPrice.set(value);
	}
	get grindProgress() {
		return get(this.w_grindProgress);
	}
	set grindProgress(value) {
		this.w_grindProgress.set(value);
	}
	get canMakeCoffee() {
		return get(this.w_canMakeCoffee);
	}
	set canMakeCoffee(value) {
		this.w_canMakeCoffee.set(value);
	}
	get makeCoffeeTime() {
		return get(this.w_makeCoffeeTime);
	}
	set makeCoffeeTime(value) {
		this.w_makeCoffeeTime.set(value);
	}
	get makeCoffeeCount() {
		return get(this.w_makeCoffeeCount);
	}
	set makeCoffeeCount(value) {
		this.w_makeCoffeeCount.set(value);
	}
	get beansPerBuy() {
		return get(this.w_beansPerBuy);
	}
	set beansPerBuy(value) {
		this.w_beansPerBuy.set(value);
	}
	get coffeePrice() {
		return get(this.w_coffeePrice);
	}
	set coffeePrice(value) {
		this.w_coffeePrice.set(value);
	}
	get maxCoffeeCups() {
		return get(this.w_maxCoffeeCups);
	}
	set maxCoffeeCups(value) {
		this.w_maxCoffeeCups.set(value);
	}
	get maxCustomers() {
		return get(this.w_maxCustomers);
	}
	set maxCustomers(value) {
		this.w_maxCustomers.set(value);
	}
	get makeCoffeeMaxBatches() {
		return get(this.w_makeCoffeeMaxBatches);
	}
	set makeCoffeeMaxBatches(value) {
		this.w_makeCoffeeMaxBatches.set(value);
	}
	get makeCoffeeCooldown() {
		return get(this.w_makeCoffeeCooldown);
	}
	set makeCoffeeCooldown(value) {
		this.w_makeCoffeeCooldown.set(value);
	}

	// stat counters
	get lifetimeGrindBeans() {
		return get(this.w_lifetimeGrindBeans);
	}
	set lifetimeGrindBeans(value) {
		this.w_lifetimeGrindBeans.set(value);
	}
	get lifetimeCoffeeSold() {
		return get(this.w_lifetimeCoffeeSold);
	}
	set lifetimeCoffeeSold(value) {
		this.w_lifetimeCoffeeSold.set(value);
	}
	get lifetimeCoffeeMade() {
		return get(this.w_lifetimeCoffeeMade);
	}
	set lifetimeCoffeeMade(value) {
		this.w_lifetimeCoffeeMade.set(value);
	}

	timer: Publisher;
	constructor(timer: Publisher, sceneManager: Publisher) {
		console.log("preshop constructor");
		this.timer = timer;
		this.timer.subscribe(this, "tick");
		this.timer.subscribe(this, "hour");
		this.timer.subscribe(this, "week");
		this.sceneManager = sceneManager;

		// Clean up other audio managers
		cleanupAudioManagers(this.audioManager);

		// Setting up audio
		this.audioManager.addMusic("bgm", aud.preshop_music);
		this.audioManager.addSFX("ding", aud.ding);
		this.audioManager.addSFX("grind", aud.crunch);
		this.audioManager.addSFX("papers", aud.papers);
		this.audioManager.addSFX("boil", aud.boiling);
		this.audioManager.addSFX("cashRegister", aud.new_cash);
		this.audioManager.addSFX("grind2", aud.crunch2);
		this.audioManager.addSFX("meow1", aud.meow_1);
		this.audioManager.addSFX("meow2", aud.meow_2);
		this.audioManager.addSFX("meow3", aud.meow_3);
		this.audioManager.addSFX("meow4", aud.meow_4);
		this.audioManager.addSFX("meow5", aud.meow_5);
		this.audioManager.addSFX("meow6", aud.meow_6);
		this.audioManager.addSFX("meow7", aud.meow_7);
		this.audioManager.addSFX("meow8", aud.meow_8);

		//set meow audio volume
		this.audioManager.setMaxVolumeScale("meow1", 0.4);
		this.audioManager.setMaxVolumeScale("meow2", 0.085);
		this.audioManager.setMaxVolumeScale("meow3", 0.07);
		this.audioManager.setMaxVolumeScale("meow4", 0.06);
		this.audioManager.setMaxVolumeScale("meow5", 0.2);
		this.audioManager.setMaxVolumeScale("meow6", 0.2);
		this.audioManager.setMaxVolumeScale("meow7", 0.2);
		this.audioManager.setMaxVolumeScale("meow8", 0.2);

		//set cash register volume
		this.audioManager.setMaxVolumeScale("cashRegister", 0.5);

		this.audioManager.playAudio("bgm");

		// UI
		this.uiManager = new UIManager();
		this.uiManager.coffeeGenerator.updateLocations(
			Array.from(
				{ length: 4 },
				(_, row) => Array.from({ length: 9 }, (_, col) => [row, col]),
			).flat(),
		);
		this.uiManager.alienGenerator.updateTypes(["catorbiter"]);
	}

	notify(event: string, data?: any) {
		if (event === "tick") {
			this.tick();
		}
		if (event === "hour") {
		}
		if (event === "week") {
			console.log("week end", data);
			// give weekly recap receipt
		}
	}

	tick() {
		if (this.waitingCustomers > 0) {
			if (this.customerPatienceCount > this.customerPatienceAmount) {
				this.waitingCustomers -= 1;
				this.customerPatienceCount = 0;
			} else {
				this.customerPatienceCount += 1;
			}
		} else this.customerPatienceCount = 0;

		this.drawCustomers();
		this.decayAppeal();
		if (!this.canMakeCoffee) {
			this.makeCoffeeTimedown();
		}
		if (this.autogrindingEnabled) {
			this.autogrindCounter++;
			if (this.autogrindCounter >= this.autogrindInterval) {
				this.grindBeans();
				this.autogrindCounter = 0;
			}
		}
		if (this.autosellEnabled) {
			this.autosellCounter++;
			if (this.autosellCounter >= this.autosellInterval) {
				this.sellCoffee(false);
				this.autosellCounter = 0;
			}
		}
	}

	drawCustomers() {
		if (this.appeal > 0) {
			// customer generation
			this.customerProgress += this.appeal;
			if (this.customerProgress >= 1) {
				this.waitingCustomers += Math.floor(this.customerProgress);
				this.waitingCustomers = Math.min(
					this.waitingCustomers,
					this.maxCustomers,
				);
				this.customerProgress %= 1;

				//play random meow audio for 20% of customers (Stipulation that no cat audio can be played back to back)
				if (Math.random() < 0.4) {
					const meowSounds = [
						"meow1",
						"meow2",
						"meow3",
						"meow4",
						"meow5",
						"meow6",
						"meow7",
						"meow8",
					];
					const randomMeow = () => {
						let availableMeows = meowSounds;
						if (this.lastPlayedMeow) {
							availableMeows = meowSounds.filter((m) =>
								m !== this.lastPlayedMeow
							);
						}
						const meow =
							availableMeows[Math.floor(Math.random() * availableMeows.length)];
						this.lastPlayedMeow = meow;
						this.audioManager.playAudio(meow);
					};
					randomMeow();
				}
			}
		}
	}

	decayAppeal() {
		// appeal decay
		if (this.appeal > this.minAppeal) {
			this.appeal = this.appeal * (1 - this.appealDecay);
		} else {
			this.appeal = this.minAppeal;
		}
	}

	makeCoffeeTimedown() {
		this.makeCoffeeTime += msPerTick;
		if (this.makeCoffeeTime > this.makeCoffeeCooldown) {
			this.makeCoffeeCount -= 1;
			this.lifetimeCoffeeMade += this.coffeeToMake;
			this.coffeeCups += this.coffeeToMake;
			this.makeCoffeeTime = 0;

			if (
				this.makeCoffeeCount == 0 || this.groundCoffee < 1 ||
				this.coffeeCups >= this.maxCoffeeCups
			) {
				// finished making coffee
				this.audioManager.stopAudio("boil");
				this.makeCoffeeTime = 0;
				this.makeCoffeeCount = 0;
				this.canMakeCoffee = true;
			} else {
				// next coffee batch
				this.makeCoffee();
			}
		}
	}

	// TODO make appeal diminishing effectiveness
	promoteShop() {
		this.customerPatienceCount = 0;
		this.audioManager.playAudio("papers");
		this.appeal += this.promotionEffectiveness *
			(1 - (this.minAppeal + this.appeal) / (this.minAppeal + this.maxAppeal));
		this.appeal = Math.min(this.appeal, this.maxAppeal);
	}

	sellCoffee(playSound: Boolean = true) {
		this.customerPatienceCount = 0;
		if (this.coffeeCups < 1) return;
		if (playSound) this.audioManager.playAudio("ding");
		if (this.waitingCustomers >= 1) {
			this.waitingCustomers--;
			this.coffeeCups--;
			this.money += this.coffeePrice * this.moneyMultiplier;
			this.lifetimeCoffeeSold++;
		}
		//ANALYTICS
		addCoffee(1);
		addMoney(this.coffeePrice * this.moneyMultiplier);
	}

	beansToGrind: number = 0;
	grindBeans() {
		if (this.beans <= 0 && this.grindProgress == -1) return;
		this.audioManager.playAudio("grind");
		// if not grinding yet
		if (this.grindProgress === -1) {
			this.grindProgress = 1;
			this.beansToGrind = Math.min(this.grindQuantity, this.beans);
			this.beans -= this.beansToGrind;
			if (this.beans < 0) this.beans = 0;
		} // if grinding
		else {
			this.grindProgress++;
		}

		// if finished grinding
		if (this.grindProgress > this.grindTime) {
			this.audioManager.playAudio("grind2");
			this.groundCoffee += this.coffeePerBean * this.beansToGrind;
			this.grindProgress = -1;
			this.lifetimeGrindBeans++;
		}
	}

	coffeeToMake: number = 0;
	makeCoffee() {
		if (this.groundCoffee < 1) return;
		// if (!this.canMakeCoffee) return;

		// start coffee batch
		if (this.canMakeCoffee) {
			this.canMakeCoffee = false;
			this.audioManager.playAudio("boil");
			this.makeCoffeeCount = this.makeCoffeeMaxBatches;
			this.makeCoffeeCount = this.makeCoffeeMaxBatches;
		}

		this.coffeeToMake = Math.min(
			this.groundCoffee,
			this.makeCoffeeQuantity,
			this.maxCoffeeCups - this.coffeeCups,
		);
		this.groundCoffee -= this.coffeeToMake;
		this.makeCoffeeTime = 0;
	}

	buyBeans() {
		// possibly make bean cost scale or change over time(?)

		this.audioManager.playAudio("cashRegister");
		if (this.money < this.beanPrice) return;
		this.beans += this.beansPerBuy;
		this.money -= this.beanPrice;
	}
	choresForBeans() {
		this.beans += 0.5;
	}

	applyCost(cost: number) {
		// if (this.money < cost) return; // flag something? DEBT
		this.money -= cost;
	}

	endScene() {
		console.log("preshop endScene()");
		// Fade out preshop bgm
		this.audioManager.fadeAudio(
			"bgm",
			1000,
			0,
			() => this.audioManager.stopAudio("bgm"),
		);
		this.timer.unsubscribe(this, "tick");
		this.timer.unsubscribe(this, "hour");
		this.timer.unsubscribe(this, "week");
		this.audioManager.disableAudio();
		this.sceneManager.emit("nextScene");
	}

	getTransferData() {
		return {
			money: this.money,
			beans: this.beans,
			hasBarista: this.autogrindingEnabled,
			hasCashier: this.autosellEnabled,
			lifetimeCoffeeMade: this.lifetimeCoffeeMade,
			lifetimeCoffeeSold: this.lifetimeCoffeeSold,
			lifetimeGrindBeans: this.lifetimeGrindBeans,
		};
	}

	loadTransferData(data: any): void {
		// pass
	}

	// save/load ////////////////////////////////////////////////////////////
	saveState() {
		console.log("preshop save state");
		let saveObj: PreshopSave = {
			money: this.money,
			beans: this.beans,
			groundCoffee: this.groundCoffee,
			coffeeCups: this.coffeeCups,
			waitingCustomers: this.waitingCustomers,
			appeal: this.appeal,
			beanPrice: this.beanPrice,
			grindProgress: this.grindProgress,
			canMakeCoffee: this.canMakeCoffee,
			makeCoffeeTime: this.makeCoffeeTime,
			makeCoffeeCount: this.makeCoffeeCount,
			coffeePrice: this.coffeePrice,
			beansPerBuy: this.beansPerBuy,

			coffeePerBean: this.coffeePerBean,
			grindTime: this.grindTime,
			grindQuantity: this.grindQuantity,
			promotionEffectiveness: this.promotionEffectiveness,
			maxCustomers: this.maxCustomers,
			maxAppeal: this.maxAppeal,
			minAppeal: this.minAppeal,
			appealDecay: this.appealDecay,
			makeCoffeeQuantity: this.makeCoffeeQuantity,
			makeCoffeeCooldown: this.makeCoffeeCooldown,
			makeCoffeeBatches: this.makeCoffeeMaxBatches,

			autogrindingEnabled: this.autogrindingEnabled,
			autogrindInterval: this.autogrindInterval,
			autogrindCounter: this.autogrindCounter,

			autosellEnabled: this.autosellEnabled,
			autosellInterval: this.autosellInterval,
			autosellCounter: this.autosellCounter,

			lifetimeGrindBeans: this.lifetimeGrindBeans,
			lifetimeCoffeeSold: this.lifetimeCoffeeSold,
			lifetimeCoffeeMade: this.lifetimeCoffeeMade,

			upgrades: {},
		};

		for (let [key, value] of this.upgrades) {
			saveObj.upgrades[key] = value;
		}

		localStorage.setItem("preshop", JSON.stringify(saveObj));
	}

	loadState() {
		console.log("preshop load state");
		const rawJSON = localStorage.getItem("preshop");

		if (rawJSON === null) return;

		const state: PreshopSave = JSON.parse(rawJSON);

		this.upgrades = new Map(Object.entries(state.upgrades));
		this.money = state.money;
		this.beans = state.beans;
		this.groundCoffee = state.groundCoffee;
		this.coffeeCups = state.coffeeCups;
		this.waitingCustomers = state.waitingCustomers;
		this.appeal = state.appeal;
		this.beanPrice = state.beanPrice;
		this.grindProgress = state.grindProgress;
		this.canMakeCoffee = state.canMakeCoffee;
		this.makeCoffeeTime = state.makeCoffeeTime;
		this.makeCoffeeCount = state.makeCoffeeCount;
		this.coffeePrice = state.coffeePrice;
		this.beansPerBuy = state.beansPerBuy;

		this.coffeePerBean = state.coffeePerBean;
		this.grindTime = state.grindTime;
		this.grindQuantity = state.grindQuantity;
		this.promotionEffectiveness = state.promotionEffectiveness;
		this.maxCustomers = state.maxCustomers;
		this.minAppeal = state.minAppeal;
		this.appealDecay = state.appealDecay;
		this.customerProgress = 0;
		this.maxAppeal = state.maxAppeal;
		this.makeCoffeeQuantity = state.makeCoffeeQuantity;
		this.makeCoffeeCooldown = state.makeCoffeeCooldown;
		this.makeCoffeeMaxBatches = state.makeCoffeeBatches;

		this.autogrindingEnabled = state.autogrindingEnabled;
		this.autogrindInterval = state.autogrindInterval;
		this.autogrindCounter = state.autogrindCounter;

		this.autosellEnabled = state.autosellEnabled;
		this.autosellInterval = state.autosellInterval;
		this.autosellCounter = state.autosellCounter;

		this.lifetimeGrindBeans = state.lifetimeGrindBeans;
		this.lifetimeCoffeeSold = state.lifetimeCoffeeSold;
		this.lifetimeCoffeeMade = state.lifetimeCoffeeMade;
	}

	clearState() {
		localStorage.removeItem("preshop");
	}
}

interface PreshopSave {
	money: number;
	beans: number;
	groundCoffee: number;
	coffeeCups: number;
	waitingCustomers: number;
	appeal: number;
	beanPrice: number;
	grindProgress: number;
	canMakeCoffee: boolean;
	makeCoffeeTime: number;
	makeCoffeeCount: number;
	coffeePrice: number;
	beansPerBuy: number;

	coffeePerBean: number;
	grindTime: number;
	grindQuantity: number;
	promotionEffectiveness: number;
	maxCustomers: number;
	maxAppeal: number;
	minAppeal: number;
	appealDecay: number;
	makeCoffeeQuantity: number;
	makeCoffeeCooldown: number;
	makeCoffeeBatches: number;

	autogrindingEnabled: boolean;
	autogrindInterval: number;
	autogrindCounter: number;

	autosellEnabled: boolean;
	autosellInterval: number;
	autosellCounter: number;

	lifetimeGrindBeans: number;
	lifetimeCoffeeSold: number;
	lifetimeCoffeeMade: number;

	upgrades: { [key: string]: number };
}
