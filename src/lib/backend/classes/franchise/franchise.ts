import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { AudioManager } from "../../systems/audioManager";
import { World } from "./world";
import { Country } from "./country";
import { Region } from "./region";
import { DevelopmentBase } from "./developments/developmentbase";

export class Franchise implements ISubscriber, IScene {
	// writable resources
	w_money: Writable<number> = writable(10000);
	w_beans: Writable<number> = writable(0);

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

	// internal stats ////////////////////////////////////////////////////////////

	sceneManager: Publisher;
	audioManager: AudioManager = new AudioManager();
	timer: Publisher;
	world: World;
	firstFarm: boolean = true;
	firstCity: boolean = true;

	// current country/region to be used by frontend
	w_currentCountry: Writable<null | Country> = writable(null);
	w_currentRegion: Writable<null | Region> = writable(null);
	w_currentDevelopment: Writable<null | DevelopmentBase> = writable(null);

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

	constructor(timer: Publisher, sceneManager: Publisher) {
		console.log("franchise constructor()");
		timer.subscribe(this, "tick");
		this.timer = timer;
		this.sceneManager = sceneManager;

		this.world = new World(this);

		// setting starting country and region. may need to change when loading existing saves.
		this.currentCountry = this.world.countries["country 1"];
		this.currentRegion = this.currentCountry!.regionList[0];
	}

	notify(event: string, data?: any) {
	}

	tick() {
		this.world.tick();
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
}
