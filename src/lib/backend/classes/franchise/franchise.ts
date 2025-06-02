import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { World } from "./world";
import { Country } from "./country";
import { Region } from "./region";
import { ResearchLab } from "./researchLab";
import { cleanupAudioManagers, AudioManager, audioManagerRegistry } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";

export class Franchise implements ISubscriber, IScene, IFranchise {
	// writable resources
	w_money: Writable<number> = writable(20000);
	w_beans: Writable<number> = writable(0);
	w_researchers: Writable<number> = writable(0);
	w_sciencePoints: Writable<number> = writable(0);
	w_taxedMoney: Writable<number> = writable(0);

	// writable getters/setters
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
	get researchers() {
		return get(this.w_researchers);
	}
	set researchers(value) {
		this.w_researchers.set(value);
	}
	get sciencePoints() {
		return get(this.w_sciencePoints);
	}
	set sciencePoints(value) {
		this.w_sciencePoints.set(value);
	}
	get taxedMoney() {
		return get(this.w_taxedMoney);
	}
	set taxedMoney(value) {
		this.w_taxedMoney.set(Math.floor(value));
	}

	// internal stats ////////////////////////////////////////////////////////////

	sceneManager: Publisher;
	timer: Publisher;
	world: World;
	researchLab: ResearchLab;
	firstFarm: boolean = true;
	firstCity: boolean = true;
	totalResearchers: number = 0;

	// current country/region to be used by frontend
	w_currentCountry: Writable<null | Country> = writable(null);
	w_currentRegion: Writable<null | Region> = writable(null);
	w_inResearchLab: Writable<Boolean> = writable(false);
	audioManager: AudioManager = new AudioManager();

	get currentCountry() {
		return get(this.w_currentCountry);
	}
	set currentCountry(value: Country | null) {
		this.w_currentCountry.set(value);
	}
	get currentRegion() {
		return get(this.w_currentRegion);
	}
	set currentRegion(value: Region | null) {
		this.w_currentRegion.set(value);
	}
	get inResearchLab() {
		return get(this.w_inResearchLab);
	}
	set inResearchLab(value) {
		this.w_inResearchLab.set(value);
	}

	//upgradable stats
	w_populationDivisor: Writable<number> = writable(20); //divide population by this to get estimated hourly customers
	w_coffeeMultiplier: Writable<number> = writable(1);
	w_waterMultiplier: Writable<number> = writable(1);
	_maxCoffeeMultiplier: number = 1;
	_populationMultiplier: number = 1;
	_researcherMultiplier: number = 1;

	get populationDivisor() {
		return get(this.w_populationDivisor);
	}
	set populationDivisor(value) {
		const old = this.populationDivisor;
		this.w_populationDivisor.set(value);
		for (let cKey in this.world.countries) {
			this.world.countries[cKey].regionList.forEach(region => {
				region.expectedCustomersPerHour /= value / old;
			});
		}
	}
	get coffeeMultiplier() {
		return get(this.w_coffeeMultiplier);
	}
	set coffeeMultiplier(value) {
		const old = this.coffeeMultiplier;
		this.w_coffeeMultiplier.set(value);
		for (let cKey in this.world.countries) {
			this.world.countries[cKey].regionList.forEach(region => {
				region.beansPerHour *= value / old;
				region.boughtBuildings.forEach(building => {
					if (building.type === 'farmBuilding') {
						building.num *= value / old;
					}
				});
				region.availableBuildings.forEach(building => {
					if (building.type === 'farmBuilding') {
						building.num *= value / old;
					}
				});
			});
		}
	}
	get maxCoffeeMultiplier() {
		return this._maxCoffeeMultiplier;
	}
	set maxCoffeeMultiplier(value) {
		const old = this._maxCoffeeMultiplier;
		this._maxCoffeeMultiplier = value;
		for (let cKey in this.world.countries) {
			this.world.countries[cKey].regionList.forEach(region => {
				region.maxCoffeePerHour *= value / old;
				region.boughtBuildings.forEach(building => {
					if (building.type === 'coffeeBuilding') {
						building.num *= value / old;
					}
				});
				region.availableBuildings.forEach(building => {
					if (building.type === 'coffeeBuilding') {
						building.num *= value / old;
					}
				});
			});
		}
	}
	get researcherMultiplier() {
		return this._maxCoffeeMultiplier;
	}
	set researcherMultiplier(value) {
		const old = this.researcherMultiplier;
		this.researcherMultiplier = value;
		this.researchers *= value / old;
	}
	get populationMultiplier() {
		return this._populationMultiplier;
	}
	set populationMultiplier(value) {
		this._populationMultiplier = value;
	}

	applyCost(cost: number): void {
		if (!this.currentCountry) return;
		if (this.currentCountry?.influence ?? 0 >= cost) {
			this.currentCountry.influence -= cost;
		}
	}

	upgrades: Map<string, number> = new Map();

	constructor(timer: Publisher, sceneManager: Publisher) {
		console.log("franchise constructor()");
		timer.subscribe(this, "tick");
		timer.subscribe(this, "hour");
		timer.subscribe(this, "day");
		this.timer = timer;
		this.sceneManager = sceneManager;

		this.world = new World(this);
		this.researchLab = new ResearchLab(this);

		// setting starting country and region. may need to change when loading existing saves.
		this.currentCountry = this.world.countries["country 1"];
		this.currentRegion = this.currentCountry!.regionList[0];

		//audio setup
		// Clean up other audio managers
		cleanupAudioManagers(this.audioManager);
		this.audioManager.addMusic("bgm", aud.franchise_music);
		this.audioManager.addSFX("ding", aud.ding);
		this.audioManager.addSFX("cashRegister", aud.new_cash);
		this.audioManager.addSFX("papers", aud.papers);
		this.audioManager.playAudio("bgm");
		// Fade in bgm
		this.audioManager.setVolume("bgm", 0);
		this.audioManager.fadeAudio("bgm", 1000, 1);
	}

	notify(event: string, data?: any) {
		if (event === "tick") {
			this.tick();
		}
		if (event == "hour") {
			this.hour();
		}
		if (event === "day") {
			this.day();
		}
	}

	tick() {
		this.researchLab.tick();
		this.world.tick();
	}

	hour() {
		this.updateMoneyPerHour();
		this.world.hour();
	}

	day() {
		this.world.day();
	}

	// franchise actions /////////////////////////////////////////////////////////
	// stuff the player can do

	// end scene ////////////////////////////////////////////////////////////////
	endScene() {
		console.log("franchise stage endScene()");
	}

	getTransferData() {
		return {};
	}

	loadTransferData() {
	}

	// save state ////////////////////////////////////////////////////////////////
	saveState() {
		console.log("franchise stage saveState()");
	}

	loadState() {
		console.log("franchise stage loadState()");

		if (!this.audioManager || !audioManagerRegistry.has(this.audioManager)) {
			this.audioManager = new AudioManager();
			this.audioManager.addMusic("bgm", aud.franchise_music);
			this.audioManager.addSFX("ding", aud.ding);
			this.audioManager.addSFX("cashRegister", aud.new_cash);
			this.audioManager.addSFX("papers", aud.papers);
			this.audioManager.playAudio("bgm");
			// Fade in bgm
			this.audioManager.setVolume("bgm", 0);
			this.audioManager.fadeAudio("bgm", 1000, 1);
		}
	}

	clearState() { }

	// to call functions on the frontend

	// Country stuff
	selectCountry(country: Country) {
		this.currentCountry = country;
	}
	deselectCountry() {
		this.currentCountry = null;
	}
	unlockRegion(regionIndex: number) {
		this.currentCountry?.unlockRegion(regionIndex);
	}
	unlockCountry() {
		this.currentCountry?.unlockCountry();
	}
	startInfluenceTask(index: number) {
		this.audioManager.playAudio("papers");
		this.currentCountry?.startInfluenceTask(index);
	}
	stopInfluenceTask(index: number) {
		this.audioManager.playAudio("papers");
		this.currentCountry?.stopInfluenceTask(index);
	}
	voteForPolicy(index: number, num: number) {
		this.audioManager.playAudio("papers");
		//this.currentCountry?.voteForPolicy(index, num);
	}
	voteAgainstPolicy(index: number, num: number) {
		this.audioManager.playAudio("papers");
		//this.currentCountry?.voteAgainstPolicy(index, num);
	}
	startRegionalVote(index: number) {
		this.audioManager.playAudio("papers");
		//this.currentCountry?.startRegionalVote(index);
	}
	buyRegion(index: number) {
		this.audioManager.playAudio("ding");
		this.currentCountry?.buyRegion(index);
	}

	//Region stuff
	selectRegion(region: Region) {
		this.currentRegion = region;
	}
	deselectRegion() {
		this.currentRegion = null;
	}
	buyUnusable() {
		//cash register sound
		this.audioManager.playAudio("ding");
		this.currentRegion?.buyUnusable();
	}

	buyBuilding(index: number) { // let me know if you'd rather have the building reference as a parameter
		//cash register sound
		this.audioManager.playAudio("ding");
		this.currentRegion?.buyBuilding(this.currentRegion.availableBuildings[index]);
	}
	sellBuilding(index: number) {
		//cash register sound
		this.audioManager.playAudio("cashRegister");
		this.currentRegion?.sellBuilding(this.currentRegion.availableBuildings[index]);
	}
	hireResearcher() {
		const hireCost = 100 * Math.pow(1.05, this.totalResearchers);
		if (this.money >= hireCost) {
			this.money -= hireCost;
			this.researchers++;
			this.totalResearchers++;
		}
	}

	//Research stuff
	selectResearchLab() {
		this.inResearchLab = true;
	}
	deselectResearchLab() {
		this.inResearchLab = false;
	}
	allocateResearchers(num: number, index: number) {
		this.researchLab.allocateResearchers(num, index);
	}
	deallocateResearchers(num: number, index: number) {
		this.researchLab.deallocateResearchers(num, index);
	}
	buyUpgrade(index: number) {
		//cash register sound
		this.audioManager.playAudio("ding");
		this.researchLab.buyUpgrade(index);
	}


	//franchise functions
	moneyPerHour: number = 0;
	updateMoneyPerHour() {
		let mph = 0;
		for (let cKey in this.world.countries) {
			this.world.countries[cKey].regionList.forEach(region => {
				mph += region.coffeesSoldLastHour * region.populationPurchasingPower;
			});
		}
		this.moneyPerHour = Math.max(mph, this.moneyPerHour);
	}
}
