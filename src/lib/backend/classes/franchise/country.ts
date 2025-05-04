import { get, type Writable, writable } from "svelte/store";
import type { World } from "./world";
import { Region } from "./region";
import { Franchise } from "./franchise";

export class Country{
	parent: World;
	w_taxRate: Writable<number> = writable(0.2);
	w_tariffRate: Writable<number> = writable(0.1);
	w_influence: Writable<number> = writable(0);
	w_influenceTaskList: Writable<IInfluenceTask[]> = writable([]);
	w_currInfluenceTasks: Writable<IInfluenceTask[]> = writable([]);
	w_maxInfluenceTasks: Writable<number> = writable(1);
	w_unlocked: Writable<boolean> = writable(false);

	get taxRate() {
		return get(this.w_taxRate);
	}
	set taxRate(value) {
		this.w_taxRate.set(value);
	}
	get tariffRate() {
		return get(this.w_tariffRate);
	}
	set tariffRate(value) {
		this.w_tariffRate.set(value);
	}
	get influenceTaskList() {
		return get(this.w_influenceTaskList);
	}
	set influenceTaskList(value: IInfluenceTask[]) {
		this.w_influenceTaskList.set(value);
	}
	get currInfluenceTasks(){
		return get(this.w_currInfluenceTasks);
	}
	set currInfluenceTasks(value){
		this.w_currInfluenceTasks.set(value);
	}
	get maxInfluenceTasks(){
		return get(this.w_maxInfluenceTasks);
	}
	set maxInfluenceTasks(value){
		this.w_maxInfluenceTasks.set(value);
	}

	influenceTasksStatic: IInfluenceTask[];

	// modifiers represent taxes and subsidies. scaler to development building costs
	farmModifier: number = 1.0;
	shopModifier: number = 1.0;
	housingModifier: number = 1.0;
	coordinates: [number, number];
	franchise: Franchise;
	firstRegions: number;
	
	w_regionList: Writable<Region[]> = writable([]);
	// need to figure out how to represent regions in a graph
	get regionList() {
		return get(this.w_regionList);
	}
	set regionList(value: Region[]) {
		this.w_regionList.set(value);
	}
	get influence() {
		return get(this.w_influence);
	}
	set influence(value) {
		this.w_influence.set(value);
	}


	constructor(parent: World, franchise: Franchise, coordinates: [number, number], influence: number, firstCountry: boolean) {
		this.parent = parent;
		this.coordinates = coordinates;
		this.franchise = franchise;
		if (firstCountry) this.firstRegions = 3;
		else this.firstRegions = 0;
		this.influence = influence;
		this.influenceTasksStatic = [];
		this.w_unlocked.set(firstCountry);
		this.initializeInfluenceTasks();
		this.refreshInfluenceTasks(3);

		this.initializeRegions(4 + Math.floor(Math.random() * 3));
	}

	tick() {
		for (const region of this.regionList) {
			region.tick();
		}
		this.tickInfluenceTasks();
	}
	
	day() {
		this.refreshInfluenceTasks(3);
	}

	initializeRegions(count: number){
		while (this.regionList.length < count) {
			const newCoords: [number, number] = [
				Math.floor(Math.random() * 1000),
				Math.floor(Math.random() * 1000)
			];

			// Check if newCoords are far enough from all existing regions
			const isSpaced = this.regionList.every(region => {
				const [x1, y1] = region.coordinates;
				const [x2, y2] = newCoords;
				const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
				return distance >= 250;
			});

			if (isSpaced) {
				if (this.firstRegions > 0){
					var newRegion = new Region(this.franchise.timer, this, this.franchise, 30, 2000 * Math.floor(Math.random() * 1000), 2, newCoords, true);
					this.firstRegions--;
				}
				else{
					var newRegion = new Region(this.franchise.timer, this, this.franchise, 10 + Math.floor(Math.random() * 30), 2000 + Math.floor(Math.random() * 1000), Math.floor(Math.random() * 3.99), newCoords, false);
				}
				this.regionList = [...this.regionList, newRegion];
				// this.regionList.push(newRegion);
			}
		}
	}	

	importBeansTo(numBeans: number, region: Region): number{ //will import as many beans as it can to the target region from all the other available regions
		var beansLeft = numBeans;
		for (const currReg of this.regionList) {
			if (beansLeft == 0) {return 0;}
			if (currReg === region) continue;
			beansLeft = region.importBeans(beansLeft, currReg);
		}
		return numBeans - beansLeft; //return the number of beans imported
	}

	unlockRegion(regionIndex: number){
		this.regionList[regionIndex].unlockRegion();
	}

	startInfluenceTask(index: number){
		if (this.franchise.money < this.influenceTaskList[index].cost || this.currInfluenceTasks.length >= this.maxInfluenceTasks) return;
		this.franchise.money -= this.influenceTaskList[index].cost;
		this.currInfluenceTasks.push(this.influenceTaskList[index]);
		this.currInfluenceTasks = [... this.currInfluenceTasks];
		this.influenceTaskList.splice(index, 1);
		this.influenceTaskList = [... this.influenceTaskList];
	}

	stopInfluenceTask(index: number){
		this.currInfluenceTasks.splice(index, 1);
		this.currInfluenceTasks = [... this.currInfluenceTasks];
	}

	tickInfluenceTasks(){
		console.log("tickin datasks");
		for (let index = 0; index < this.currInfluenceTasks.length; index++) {
			const task = this.currInfluenceTasks[index];
			task.time -= 0.25;
			if (task.time <= 0){
				this.influence += task.influence;
				this.currInfluenceTasks.splice(index, 1);
			}
		}
		this.currInfluenceTasks = [... this.currInfluenceTasks];
	}

	refreshInfluenceTasks(amount: number) {
		const shuffled = [...this.influenceTasksStatic];

		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		this.influenceTaskList = shuffled.slice(0, amount);
	}

	initializeInfluenceTasks() {
		this.influenceTasksStatic.push({
			desc: "Shake hands with the president",
			cost: 1000,
			influence: 100,
			time: 20,
		});
		this.influenceTasksStatic.push({
			desc: "Put out a video glazing their president",
			cost: 2000,
			influence: 300,
			time: 30,
		});
		this.influenceTasksStatic.push({
			desc: "Send the president a corn dog",
			cost: 500,
			influence: 50,
			time: 10,
		});
	}	  
}