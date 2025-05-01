import { get, writable, type Writable } from "svelte/store";
import type { Franchise } from "./franchise";

export class ResearchLab{
	w_currentTaskList: Writable<IResearchTask[]> = writable([]);
	w_UpgradeList: Writable<IResearchUpgrade[]> = writable([]);
	w_researcherSpeed: Writable<number> = writable(1);
	
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
		console.log('tick');
	}

	allocateResearchers(num: number, index: number) {
		const res = Math.min(this.franchise.researchers, num);

		this.w_currentTaskList.update(list => {
			list[index].researchersAllocated += res;
			this.franchise.researchers -= res;
			return list;
		});
	}

	deallocateResearchers(num: number, index: number) {
		const res = Math.min(this.currentTaskList[index].researchersAllocated, num);

		this.w_currentTaskList.update(list => {
			list[index].researchersAllocated -= res;
			this.franchise.researchers += res;
			return list;
		});
	}
	

	tickTasks() {
		this.w_currentTaskList.update(taskList => {
			for (let i = taskList.length - 1; i >= 0; i--) {
				const task = taskList[i];
				task.researchUnits -= task.researchersAllocated * this.researcherSpeed;
	
				if (task.researchUnits <= 0) {
					this.franchise.sciencePoints += task.sciencePoints;
					this.franchise.researchers += task.researchersAllocated;
					taskList.splice(i, 1); // remove completed task
				}
			}

			if (taskList.length === 0) {
				this.updateTasks();
			}
	
			return taskList;
		});
	}
	

	updateTasks() {
		for (let index = 0; index < 3; index++) {
			this.currentTaskList.push(this.createTask(this.researchLevel));
		}
		this.researchLevel++;
	}

	createTask(researchLevel: number): IResearchTask {
		const desc = this.taskNames[Math.floor(Math.random() * this.taskNames.length)];
		const researchUnits = Math.floor(10000 * Math.pow(5, researchLevel));
		const researchersAllocated = 0;
		const sciencePoints = Math.floor(100 * Math.pow(2.3, researchLevel));
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
			this.upgradeList.splice(index, 1);
			this.upgradeList = [...this.upgradeList]
		}
	}

	estimateTime(index: number): number {
		const task = this.currentTaskList[index];

		return task.researchUnits / (task.researchersAllocated * this.researcherSpeed * 4); //4 ticks per second
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