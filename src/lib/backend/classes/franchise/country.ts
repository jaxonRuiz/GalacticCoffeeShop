import { get, type Writable, writable } from "svelte/store";
import type { World } from "./world";
import { Region } from "./region";
import { Franchise } from "./franchise";
import { cleanupAudioManagers, AudioManager } from "../../systems/audioManager";
import { aud } from "../../../assets/aud";

export class Country{
	parent: World;
	w_taxRate: Writable<number> = writable(0.2);
	w_influence: Writable<number> = writable(0);
	w_influenceTaskList: Writable<IInfluenceTask[]> = writable([]);
	w_currInfluenceTasks: Writable<IInfluenceTask[]> = writable([]);
	w_maxInfluenceTasks: Writable<number> = writable(1);
	w_unlocked: Writable<boolean> = writable(false);

	w_policyEvents: Writable<IPolicyEvent[]> = writable([]);

	get taxRate() {
		return get(this.w_taxRate);
	}
	set taxRate(value) {
		this.w_taxRate.set(Math.min(value, 0.5));
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
	get policyEvents(){
		return get(this.w_policyEvents);
	}
	set policyEvents(value: IPolicyEvent[]){
		this.w_policyEvents.set(value);
	}
	get unlocked(){
		return get(this.w_unlocked);
	}
	set unlocked(value) {
		this.w_unlocked.set(value);
		if (value) {
			//this.startRandomEvents();
		}
	}

	influenceTasksStatic: IInfluenceTask[];

	// modifiers represent taxes and subsidies. scaler to development building costs
	farmModifier: number = 1.0;
	shopModifier: number = 1.0;
	housingModifier: number = 1.0;
	coordinates: [number, number];
	franchise: Franchise;
	firstRegions: number;
	unlockCost: number = 500;
	countryNum: number = 0;

	//audio manager
	audioManager: AudioManager;
	
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


	constructor(parent: World, franchise: Franchise, coordinates: [number, number], influence: number, countryNum: number) {
		this.parent = parent;
		this.coordinates = coordinates;
		this.franchise = franchise;
		this.countryNum = countryNum;
		if (countryNum === 1) this.firstRegions = 3;
		else this.firstRegions = 0;
		this.unlocked = (countryNum === 1);
		this.influence = influence;
		if (countryNum === 1) this.influence = 500;
		this.influenceTasksStatic = [];
		this.initializeInfluenceTasks();
		this.refreshInfluenceTasks(3);

		this.initializeRegions(4 + Math.floor(Math.random() * 3));

		//audio
		this.audioManager = franchise.audioManager;
	}

	tick() {
		for (const region of this.regionList) {
			region.tick();
		}
		this.tickInfluenceTasks();
		//this.tickPolicyEvents();
	}

	hour() {
		for (const region of this.regionList) {
			region.hour();
		}
	}
	
	day() {
		for (const region of this.regionList) {
			region.day();
		}
		this.refreshInfluenceTasks(3);
	}

	initializeRegions(count: number){
		while (this.regionList.length < count) {
			const newCoords: [number, number] = [
				Math.floor(Math.random() * 1000),
				Math.floor(Math.random() * 1000)
			];

			const isSpaced = this.regionList.every(region => {
				const [x1, y1] = region.coordinates;
				const [x2, y2] = newCoords;
				const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
				return distance >= 250;
			});

			if (isSpaced) {
				if (this.firstRegions > 0){
					if (this.firstRegions == 3) var newRegion = new Region(this, this.franchise, 30, 2, newCoords, true, 1);
					else var newRegion = new Region(this, this.franchise, 30, Math.floor(Math.random() * 3.99), newCoords, true, 1);
					this.firstRegions--;
				}
				else{
					var newRegion = new Region(this, this.franchise, 10 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 3.99), newCoords, false, Math.pow(1.5, this.countryNum));
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

	unlockCountry(){
		if (this.influence >= this.unlockCost){
			this.unlocked = true;
			this.influence -= this.unlockCost;
		}
	}

	unlockRegion(regionIndex: number){
		this.regionList[regionIndex].unlockRegion();
	}

	startInfluenceTask(index: number){ // begin a task
		if (this.franchise.money < this.influenceTaskList[index].cost || this.currInfluenceTasks.length >= this.maxInfluenceTasks) return;
		this.franchise.money -= this.influenceTaskList[index].cost;
		this.currInfluenceTasks.push(this.influenceTaskList[index]);
		this.currInfluenceTasks = [... this.currInfluenceTasks];
		this.influenceTaskList.splice(index, 1);
		this.influenceTaskList = [... this.influenceTaskList];
	}

	stopInfluenceTask(index: number){ // cancel a task
		this.currInfluenceTasks.splice(index, 1);
		this.currInfluenceTasks = [... this.currInfluenceTasks];
	}

	addInfluence(amount: number) {
		this.influence = Math.min(1000, this.influence + amount)
	}

	subtractInfluence(amount: number) {
		this.influence = Math.max(0, this.influence - amount)
	}

	tickInfluenceTasks(){ // keep tasks up to date
		for (let index = 0; index < this.currInfluenceTasks.length; index++) {
			const task = this.currInfluenceTasks[index];
			task.time -= 0.25;
			if (task.time <= 0){
				this.addInfluence(task.influence);
				this.currInfluenceTasks.splice(index, 1);
			}
		}
		this.currInfluenceTasks = [... this.currInfluenceTasks];
	}

	refreshInfluenceTasks(amount: number) { // refresh list of tasks
		const shuffled = [...this.influenceTasksStatic];

		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		this.influenceTaskList = shuffled.slice(0, amount);
	}

	buyRegion(index: number) {
		if (this.influence >= this.regionList[index].unlockCost) {
			this.influence -= this.regionList[index].unlockCost;
			this.unlockRegion(index);
		}
	}

	initializeInfluenceTasks() { // initialize a list of tasks that will be pulled from in refreshInfluenceTasks
		this.influenceTasksStatic.push({
			desc: "Shake hands with da president",
			cost: 1000,
			influence: 100,
			time: 20,
		});
		this.influenceTasksStatic.push({
			desc: "Put out a video praising the infrastructure",
			cost: 2000,
			influence: 200,
			time: 30,
		});
		this.influenceTasksStatic.push({
			desc: 'Send their president a corn dog (and write "not a bomb" on the label so he knows)',
			cost: 500,
			influence: 50,
			time: 10,
		});
		this.influenceTasksStatic.push({
			desc: "Do a backflip in front of their congress",
			cost: 1000,
			influence: 100,
			time: 20,
		});
		this.influenceTasksStatic.push({
			desc: "Call their president and tell them you love them",
			cost: 500,
			influence: 50,
			time: 10,
		});
	}

	

	// startPolicyEvent(event: IPolicyEvent) { // start a policy event
	// 	this.policyEvents.push(event);
	// 	this.policyEvents = [... this.policyEvents];
	// }

	// voteForPolicy(index: number, num: number){ // spend influence to vote for a policy
	// 	const amount = Math.min(this.policyEvents[index].totalInfluence - this.policyEvents[index].currentInfluence, num);
	// 	if (this.influence < amount || this.policyEvents[index].currentInfluence >= this.policyEvents[index].totalInfluence) return;
	// 	this.influence -= amount;
	// 	this.policyEvents[index].currentInfluence += amount;
	// 	this.policyEvents = [... this.policyEvents];
	// }

	// voteAgainstPolicy(index: number, num: number){ // spend influence to vote against a policy
	// 	const amount = Math.min(this.policyEvents[index].currentInfluence, num);
	// 	if (this.influence < amount || this.policyEvents[index].currentInfluence <= 0) return;
	// 	this.influence -= amount;
	// 	this.policyEvents[index].currentInfluence -= amount;
	// 	this.policyEvents = [... this.policyEvents];
	// }

	// tickPolicyEvents(){ // update the list of policy events
	// 	for (let index = 0; index < this.policyEvents.length; index++) {
	// 		const event = this.policyEvents[index];
	// 		event.time -= 0.25;
	// 		if (event.time <= 0){
	// 			if (Math.random() < event.currentInfluence/event.totalInfluence){
	// 				event.won(this);
	// 			}
	// 			else {
	// 				event.lost(this);
	// 			}
	// 			event.eitherWay(this);
	// 			this.policyEvents.splice(index, 1);
	// 		}
	// 	}
	// 	this.policyEvents = [... this.policyEvents];
	// }

	// startRegionalVote(index: number){ // add a policy event to the list for the region unlock
	// 	const self = this;
	// 	if (this.franchise.money < this.regionList[index].unlockCost) return;
	// 	this.franchise.money -= this.regionList[index].unlockCost;
	// 	this.regionList[index].voteInProgress = true; //MUST MATCH WITH THE EVENT
	// 	this.policyEvents.push({
	// 		desc: `A vote to unlock region ${index + 1}`,
	// 		time: 20,
	// 		currentInfluence: 100,
	// 		totalInfluence: 300,
	// 		won(country) {
	// 			country.unlockRegion(index);
	// 		},
	// 		lost(country) {
			
	// 		},
	// 		eitherWay(country) {
	// 			country.regionList[index].voteInProgress = false;
	// 		},
	// 	})
	// }

	wait(seconds: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, seconds * 1000));
	}

// 	async startRandomEvents() {
// 		if (!this.unlocked || this.policyEvents.length >= 2) return;
// 		await this.wait(Math.floor(40 + Math.random() * 20));
// 		this.policyEvents.push(this.getRandomEvent());
// 		this.policyEvents = [... this.policyEvents];
// 		await this.startRandomEvents();
// 	}

// 	getRandomEvent(): IPolicyEvent{
// 		const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
// 		return {
// 			desc: event.desc,
// 			time: event.time,
// 			currentInfluence: Math.floor(event.totalInfluence * (0.25 + Math.random() * 0.5)),
// 			totalInfluence: event.totalInfluence,
// 			won(country) {
// 				event.won(country);
// 			},
// 			lost(country) {
// 				event.lost(country);
// 			},
// 			eitherWay(country) {
// 				event.eitherWay(country);
// 			},
// 		}
// 	}
}

const randomEvents: IPolicyEvent[] = [
	{
		desc: 'President wants to impose a cafe specific tax',
		time: 50,
		currentInfluence: 0,
		totalInfluence: 100,
		won(country) {
			country.taxRate *= 1.1;
		},
		lost(country) {
			
		},
		eitherWay(country) {
			
		},
	},
	{
		desc: 'President wants a coffee bean tax',
		time: 50,
		currentInfluence: 0,
		totalInfluence: 200,
		won(country) {
			country.taxRate *= 1.2;
		},
		lost(country) {
			
		},
		eitherWay(country) {
			
		},
	},
	{
		desc: 'President feels bad about imposing coffee bean taxes and wants to lower them again',
		time: 60,
		currentInfluence: 0,
		totalInfluence: 100,
		won(country) {
			country.taxRate /= 1.3;
		},
		lost(country) {
			
		},
		eitherWay(country) {
			
		},
	},
	{
		desc: 'Congress wants to lower taxes for some reason',
		time: 50,
		currentInfluence: 10,
		totalInfluence: 200,
		won(country) {
			country.taxRate /= 1.4;
		},
		lost(country) {
			
		},
		eitherWay(country) {
			
		},
	},
]