import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { AudioManager } from "../../systems/audioManager";
import { World } from "./world";
import { Country } from "./country";
import { Region } from "./region";
import { DevelopmentBase } from "./developments/developmentbase";
import { ResearchLab } from "./researchLab";

export class Franchise implements ISubscriber, IScene {
	// writable resources
	w_money: Writable<number> = writable(10000);
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
	audioManager: AudioManager = new AudioManager();
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

	get populationDivisor() {
		return get(this.w_populationDivisor);
	}
	set populationDivisor(value) {
		this.w_populationDivisor.set(value);
	}
	get coffeeMultiplier() {
		return get(this.w_coffeeMultiplier);
	}
	set coffeeMultiplier(value) {
		this.w_coffeeMultiplier.set(value);
	}

	constructor(timer: Publisher, sceneManager: Publisher) {
		console.log("franchise constructor()");
		timer.subscribe(this, "tick");
		timer.subscribe(this, "day");
		this.timer = timer;
		this.sceneManager = sceneManager;

		this.world = new World(this);
		this.researchLab = new ResearchLab(this);

		// setting starting country and region. may need to change when loading existing saves.
		this.currentCountry = this.world.countries["country 1"];
		this.currentRegion = this.currentCountry!.regionList[0];
	}

	notify(event: string, data?: any) {
		if (event === "tick"){
			this.tick();
		}
		if (event === "day") {
			this.day();
		}
	}

	tick() {
		//this.world.tick();
		this.researchLab.tick();
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

	clearState() {}

	// to call functions on the frontend
	
	// Country stuff
	selectCountry(country: Country){
		this.currentCountry = country;
	}
	deselectCountry(){
		this.currentCountry = null;
	}
	unlockRegion(regionIndex: number){
		this.currentCountry?.unlockRegion(regionIndex);
	}
	attemptDiplomacyUpgrade(index:number){
		this.currentCountry?.attemptDiplomacyUpgrade(index);
	}

	//Region stuff
	increaseDevelopmentArea(development: string, areaSize: number = 1) {
		this.currentDevelopment?.increaseDevelopmentArea(areaSize);
	}
	decreaseDevelopmentArea(development: string, areaSize: number = 1) {
		this.currentDevelopment?.decreaseDevelopmentArea(areaSize);
	}
	selectRegion(region: Region){
		this.currentRegion = region;
	}
	deselectRegion(){
		this.currentRegion = null;
	}

	//Development stuff
	buyBuilding(index: number){ // let me know if you'd rather have the building reference as a parameter
		this.currentDevelopment?.buyBuilding(this.currentDevelopment.availableBuildings[index]);
	}
	sellBuilding(index: number){ 
		this.currentDevelopment?.sellBuilding(this.currentDevelopment.availableBuildings[index]);
	}
	selectDevelopment(development: DevelopmentBase){
		this.currentDevelopment = development;
	}
	deselectDevelopment(){
		this.currentDevelopment = null;
	}

	buyRegion(region: Region): boolean{
		return region.unlockRegion();
	}

	//Research stuff
	selectResearchLab(){
		this.inResearchLab = true;
	}
	deselectResearchLab(){
		this.inResearchLab = false;
	}
	allocateResearchers(num: number, index: number) {
		this.researchLab.allocateResearchers(num, index);
	}
	deallocateResearchers(num: number, index: number) {
		this.researchLab.deallocateResearchers(num, index);
	}
	buyUpgrade(index: number){
		this.researchLab.buyUpgrade(index);
	}
}
