import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { World } from "./world";
import { Country } from "./country";
import { Region } from "./region";
import { DevelopmentBase } from "./developments/developmentbase";
import { ResearchLab } from "./researchLab";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";

export class Franchise implements ISubscriber, IScene {
	// writable resources
	w_money: Writable<number> = writable(20000);
	w_beans: Writable<number> = writable(0);
	w_researchers: Writable<number> = writable(0);
	w_sciencePoints: Writable<number> = writable(0);

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

	// internal stats ////////////////////////////////////////////////////////////

	sceneManager: Publisher;
	timer: Publisher;
	world: World;
	researchLab: ResearchLab;
	firstFarm: boolean = true;
	firstCity: boolean = true;

	// current country/region to be used by frontend
	w_currentCountry: Writable<null | Country> = writable(null);
	w_currentRegion: Writable<null | Region> = writable(null);
	w_currentDevelopment: Writable<null | DevelopmentBase> = writable(null);
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
	get currentDevelopment() {
		return get(this.w_currentDevelopment);
	}
	set currentDevelopment(value: DevelopmentBase | null) {
		this.w_currentDevelopment.set(value);
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
				region.developmentList["farm"].boughtBuildings.forEach(building => {
					if (building.type === 'farmBuilding') {
						building.num *= value / old;
					}
				});
				region.developmentList["farm"].availableBuildings.forEach(building => {
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
				region.developmentList["residential"].boughtBuildings.forEach(building => {
					if (building.type === 'coffeeBuilding') {
						building.num *= value / old;
					}
				});
				region.developmentList["residential"].availableBuildings.forEach(building => {
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
		for (let cKey in this.world.countries) {
			this.world.countries[cKey].regionList.forEach(region => {
				region.developmentList["logistic"].boughtBuildings.forEach(building => {
					if (building.type === 'researchBuilding') {
						building.num *= value / old;
					}
				});
				region.developmentList["logistic"].availableBuildings.forEach(building => {
					if (building.type === 'researchBuilding') {
						building.num *= value / old;
					}
				});
			});
		}
	}
	get populationMultiplier() {
		return this._populationMultiplier;
	}
	set populationMultiplier(value) {
		const old = this.populationMultiplier;
		this._populationMultiplier = value;
		for (let cKey in this.world.countries) {
			this.world.countries[cKey].regionList.forEach(region => {
				region.population *= value / old;
				region.developmentList["residential"].boughtBuildings.forEach(building => {
					if (building.type === 'housingBuilding') {
						building.num *= value / old;
					}
				});
				region.developmentList["residential"].availableBuildings.forEach(building => {
					if (building.type === 'housingBuilding') {
						building.num *= value / old;
					}
				});
			});
		}
	}
	get waterMultiplier() {
		return get(this.w_waterMultiplier);
	}
	set waterMultiplier(value) {
		const old = this.waterMultiplier;
		this.w_waterMultiplier.set(value);
		for (let cKey in this.world.countries) {
			this.world.countries[cKey].regionList.forEach(region => {
				region.waterPerHour *= value / old;
				region.developmentList["farm"].boughtBuildings.forEach(building => {
					if (building.type === 'waterBuilding') {
						building.num *= value / old;
					}
				});
				region.developmentList["farm"].availableBuildings.forEach(building => {
					if (building.type === 'waterBuilding') {
						building.num *= value / old;
					}
				});
			});
		}
	}

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
		this.currentCountry?.startInfluenceTask(index);
	}
	stopInfluenceTask(index: number) {
		this.currentCountry?.stopInfluenceTask(index);
	}
	voteForPolicy(index: number, num: number) {
		this.audioManager.playAudio("papers");
		this.currentCountry?.voteForPolicy(index, num);
	}
	voteAgainstPolicy(index: number, num: number) {
		this.audioManager.playAudio("papers");
		this.currentCountry?.voteAgainstPolicy(index, num);
	}
	startRegionalVote(index: number) {
		this.currentCountry?.startRegionalVote(index);
	}

	//Region stuff
	increaseDevelopmentArea(development: string, areaSize: number = 1) {
		this.currentDevelopment?.increaseDevelopmentArea(areaSize);
	}
	decreaseDevelopmentArea(development: string, areaSize: number = 1) {
		this.currentDevelopment?.decreaseDevelopmentArea(areaSize);
	}
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

	//Development stuff
	buyBuilding(index: number) { // let me know if you'd rather have the building reference as a parameter
		//cash register sound
		this.audioManager.playAudio("ding");
		this.currentDevelopment?.buyBuilding(this.currentDevelopment.availableBuildings[index]);
	}
	sellBuilding(index: number) {
		//cash register sound
		this.audioManager.playAudio("cashRegister");
		this.currentDevelopment?.sellBuilding(this.currentDevelopment.availableBuildings[index]);
	}
	selectDevelopment(development: DevelopmentBase) {
		this.currentDevelopment = development;
	}
	deselectDevelopment() {
		this.currentDevelopment = null;
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
