import { get, type Writable, writable } from "svelte/store";
import { globalVolumeScale, musicVolume, sfxVolume } from "../systems/audioManager";
import { Publisher } from "../systems/observer";
import { msPerTick } from "../systems/time";
import { cleanupAudioManagers, AudioManager } from "../systems/audioManager";
import { aud } from "../../assets/aud";
import { UIManager } from "../interface/uimanager";

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
	w_beanPrice: Writable<number> = writable(5.99);
	w_grindProgress: Writable<number> = writable(-1); // -1 means not grinding
	w_canMakeCoffee: Writable<boolean> = writable(true);
	w_makeCoffeeTime: Writable<number> = writable(0);
	w_makeCoffeeCount: Writable<number> = writable(0);
	w_beansPerBuy: Writable<number> = writable(3);
	w_coffeePrice: Writable<number> = writable(3.5);

	// internal stats
	coffeePerBean: number = 2.5;
	grindQuantity: number = 1; // how many beans are ground at a time
	grindTime: number = 5; // number of times to click to grind a bean
	customerProgress: number = 0; // progress to next customer
	promotionEffectiveness: number = 0.1; // current rate of customer generation
	appealDecay: number = 0.05; // rate of decay of customer appeal
	maxCustomers: number = 5;
	maxAppeal: number = 0.7;
	minAppeal: number = 0; // minimum appeal (after decay)
	makeCoffeeQuantity: number = 3; // how many cups of coffee are made per run
	makeCoffeeCooldown: number = 2000; // cooldown for making coffee IN MILLISECONDS
	makeCoffeeBatches: number = 1; // how many cups of coffee are made per run
	runTutorial: boolean = true;

	autogrindingEnabled: boolean = false; // whether or not to grind automatically
	autogrindInterval: number = 10;
	autogrindCounter: number = 0;

	autosellEnabled: boolean = false; // whether or not to sell automatically
	autosellInterval: number = 15;
	autosellCounter: number = 0;

	// stat counters
	w_lifetimeGrindBeans: Writable<number> = writable(0);
	w_lifetimeCoffeeSold: Writable<number> = writable(0);
	w_lifetimeCoffeeMade: Writable<number> = writable(0);

	// contains list of upgrades (IDs) and their levels
	upgrades: Map<string, number> = new Map();

	sceneManager: Publisher;
	audioManager: AudioManager = new AudioManager();
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
	}
	get waitingCustomers() {
		return get(this.w_waitingCustomers);
	}
	set waitingCustomers(value) {
		this.w_waitingCustomers.set(value);
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

	constructor(timer: Publisher, sceneManager: Publisher) {
		timer.subscribe(this, "tick");
		timer.subscribe(this, "hour");
		timer.subscribe(this, "week");
		this.sceneManager = sceneManager;

		// Clean up other audio managers
		cleanupAudioManagers(this.audioManager);

		// Setting up audio
		this.audioManager.addMusic("bgm", aud.preshop_music);
		this.audioManager.addSFX("ding", aud.ding);
		this.audioManager.addSFX("grind", aud.crunch);
		this.audioManager.addSFX("papers", aud.papers);
		this.audioManager.addSFX("boil", aud.boiling);
		this.audioManager.addSFX("cashRegister", aud.cashRegister);
		this.audioManager.addSFX("grind2", aud.crunch2);
		this.audioManager.addAmbience("crowd", aud.new_crowd);

		this.audioManager.playAudio("bgm");
		this.audioManager.playAudio("crowd");

		// UI
		this.uiManager = new UIManager();
		this.uiManager.coffeeGenerator.updateLocations(
			Array.from({ length: 4 }, (_, row) =>
				Array.from({ length: 9 }, (_, col) => [row, col])
			).flat());
		this.uiManager.alienGenerator.updateTypes(['catorbiter']);
	}

	notify(event: string, data?: any) {
		if (event === "tick") {
			this.tick();
		}
		if (event === "hour") {
			if (this.waitingCustomers > 0) {
				this.waitingCustomers--;
				this.uiManager.customerLeaving();
			}
			// this.decayAppeal();
		}
		if (event === "week") {
			console.log("week end", data);
			// give weekly recap receipt
		}
	}

	tick() {
		if (this.waitingCustomers < 1) {
			this.audioManager.setVolume("crowd", 0);
		}
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
				this.sellCoffee();
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
					this.maxCustomers
				);
				this.customerProgress %= 1;

				// Scale crowd volume by the number of customers and global/music volume
				const crowdVolume = Math.min(this.waitingCustomers / this.maxCustomers, 1);
				const scaledVolume = crowdVolume * (get(globalVolumeScale)) * (get(musicVolume) * 0.25);
				this.audioManager.setVolume("crowd", scaledVolume);
				
				// ui
				this.uiManager.newCustomer(this.waitingCustomers);
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

			if (this.makeCoffeeCount == 0 || this.groundCoffee < 1) {
				// finished making coffee
				this.audioManager.stopAudio("boil");
				this.makeCoffeeTime = 0;
				this.makeCoffeeCount = 0;
				this.canMakeCoffee = true;
				this.uiManager.coffeeMade(this.coffeeCups);
			} else {
				// next coffee batch
				this.makeCoffee();
			}
		}
	}

	// TODO make appeal diminishing effectiveness
	promoteShop() {
		this.audioManager.playAudio("papers");
		this.appeal +=
			this.promotionEffectiveness *
			(1 - (this.minAppeal + this.appeal) / (this.minAppeal + this.maxAppeal));
		this.appeal = Math.min(this.appeal, this.maxAppeal);
	}

	sellCoffee() {
		if (this.coffeeCups < 1) return;
		this.audioManager.playAudio("ding");
		if (this.waitingCustomers >= 1) {
			this.waitingCustomers--;
			this.coffeeCups--;
			this.money += this.coffeePrice * this.moneyMultiplier;
			this.lifetimeCoffeeSold++;
			
			// ui
			this.uiManager.coffeeSold();
		}
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
			this.makeCoffeeCount = this.makeCoffeeBatches;
		}

		// possibly add cooldown or timer effect
		this.coffeeToMake = Math.min(this.groundCoffee, this.makeCoffeeQuantity);
		this.groundCoffee -= this.coffeeToMake;
		this.makeCoffeeTime = 0;
	}

	buyBeans() {
		// possibly make bean cost scale or change over time(?)

		this.audioManager.setVolume("cashRegister", 0.5);
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
		this.audioManager.disableAudio();
		this.sceneManager.emit("nextScene");
	}

	getTransferData() {
		return {
			money: this.money,
			beans: this.beans,
			hasBarista: this.autogrindingEnabled,
			hasCashier: this.autosellEnabled,
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
			makeCoffeeBatches: this.makeCoffeeBatches,

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
		this.makeCoffeeBatches = state.makeCoffeeBatches;

		this.autogrindingEnabled = state.autogrindingEnabled;
		this.autogrindInterval = state.autogrindInterval;
		this.autogrindCounter = state.autogrindCounter;

		this.autosellEnabled = state.autosellEnabled;
		this.autosellInterval = state.autosellInterval;
		this.autosellCounter = state.autosellCounter;

		this.lifetimeGrindBeans = state.lifetimeGrindBeans;
		this.lifetimeCoffeeSold = state.lifetimeCoffeeSold;
		this.lifetimeCoffeeMade = state.lifetimeCoffeeMade;

		this.uiManager.coffeeMade(this.coffeeCups);
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
