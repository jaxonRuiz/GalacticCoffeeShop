import { get, writable, type Writable } from "svelte/store";
import type { Franchise } from "./franchise";

export class ResearchLab{
	w_currentTaskList: Writable<IResearchTask[]> = writable([]);
	w_UpgradeList: Writable<IResearchUpgrade[]> = writable([]);
	w_researcherSpeed: Writable<number> = writable(50);
	
	get currentTaskList() {
		return get(this.w_currentTaskList);
	}
	set currentTaskList(value: IResearchTask[]) {
		this.w_currentTaskList.set(value);
	}
	get researcherSpeed() {
		return get(this.w_researcherSpeed);
	}
	set researcherSpeed(value) {
		this.w_researcherSpeed.set(value);
	}
	get upgradeList() {
		return get(this.w_UpgradeList);
	}
	set upgradeList(value: IResearchUpgrade[]) {
		this.w_UpgradeList.set(value);
	}

	franchise: Franchise;
	researchLevel: number = 0;

	taskNames: string[] = ["Analyze coffee molecules", "Dissect cocoa plants", "Optimize atomic structure of coffee"];

	constructor(franchise: Franchise){
		this.franchise = franchise;
		this.initializeUpgrades();
		this.updateTasks();
	}

	tick(){
		this.tickTasks();
	}

	allocateResearchers(num: number, index: number){
		const res = Math.min(this.franchise.researchers, num);
		this.currentTaskList[index].researchersAllocated += res;
		this.franchise.researchers -= res;
	}

	tickTasks(){
		for (let i = this.currentTaskList.length - 1; i >= 0; i--) {
			const element = this.currentTaskList[i];
			element.researchUnits -= element.researchersAllocated * this.researcherSpeed;
		
			if (element.researchUnits <= 0) {
				this.franchise.sciencePoints += element.sciencePoints;
				this.currentTaskList.splice(i, 1);
				this.currentTaskList = [... this.currentTaskList]; //update fo svelte!
			}

			if (this.currentTaskList.length == 0) {
				this.updateTasks();
			}
		}
		
	}

	updateTasks() {
		for (let index = 0; index < 3; index++) {
			this.currentTaskList.push(this.createTask(this.researchLevel));
		}
		this.researchLevel++;
	}

	createTask(researchLevel: number): IResearchTask {
		const desc = this.taskNames[Math.floor(Math.random() * this.taskNames.length)];
		const researchUnits = 10000 * Math.pow(5, researchLevel);
		const researchersAllocated = 0;
		const sciencePoints = 100 * Math.pow(2.3, researchLevel);
		return {
			desc: desc,
			researchUnits: researchUnits,
			researchersAllocated: researchersAllocated,
			sciencePoints: sciencePoints
		}
	}

	buyUpgrade(index: number){
		const up = this.upgradeList[index];
		if (this.franchise.sciencePoints >= up.cost){
			up.effect(this.franchise);
			this.franchise.sciencePoints -= up.cost;
		}
	}

	initializeUpgrades() {
		this.upgradeList.push({
			name: "Try adding a magical substance to your coffee",
			desc: "Attract 2x as many customers",
			cost: 100,
			effect(franchise) {
				franchise.populationDivisor /= 2;
			}
		})
		this.upgradeList.push({
			name: "Discover how to multiply coffee molecules",
			desc: "3x coffee production",
			cost: 200,
			effect(franchise) {
				franchise.coffeeMultiplier *= 3;
			}
		})
	}
}