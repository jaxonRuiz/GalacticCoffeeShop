import { get, type Writable, writable } from "svelte/store";
import type { World } from "./world";
import { Region } from "./region";
import { Franchise } from "./franchise";

export class Country{
	parent: World;
	w_taxRate: Writable<number> = writable(0.2);
	w_tariffRate: Writable<number> = writable(0.1);
	w_diplomacy: Writable<number> = writable(0);
	w_diplomacyUpgradeList: Writable<IDiplomacyUpgrade[]> = writable([]);
	w_diplomacyEventStrings: Writable<string[]> = writable([]);

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
	get diplomacyUpgradeList() {
		return get(this.w_diplomacyUpgradeList);
	}
	set diplomacyUpgradeList(value: IDiplomacyUpgrade[]) {
		this.w_diplomacyUpgradeList.set(value);
	}
	get diplomacyEventStrings() {
		return get(this.w_diplomacyEventStrings);
	}
	set diplomacyEventStrings(value: string[]) {
		this.w_diplomacyEventStrings.set(value);
	}

	diplomacyUpgradesStatic: IDiplomacyUpgrade[];

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
	get diplomacy() {
		return get(this.w_diplomacy);
	}
	set diplomacy(value) {
		this.w_diplomacy.set(value);
	}


	constructor(parent: World, franchise: Franchise, coordinates: [number, number], diplomacy: number, firstCountry: boolean) {
		this.parent = parent;
		this.coordinates = coordinates;
		this.franchise = franchise;
		if (firstCountry) this.firstRegions = 3;
		else this.firstRegions = 0;
		this.diplomacy = diplomacy;
		this.diplomacyUpgradesStatic = [];
		this.initializeDiplomacyUpgrades();
		this.refreshDiplomacyUpgrades(3);

		this.initializeRegions(4 + Math.floor(Math.random() * 3));
	}

	tick() {
		for (const region of this.regionList) {
			region.tick();
		}
	}
	
	day() {
		this.refreshDiplomacyUpgrades(3);
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

	attemptDiplomacyUpgrade(index: number){
		console.log(Math.random() * 100);
		var upgrade = this.diplomacyUpgradeList[index];
		var og = this.diplomacy;

		if (this.franchise.money >= upgrade.cost){
			console.log("attempting diplomacy upgrade");
			this.franchise.money -= upgrade.cost;
			if (Math.random() * 100 <= upgrade.successRate){
				this.diplomacy = Math.min(upgrade.diplomacyIncrease + this.diplomacy, 1000);
			}
			else{
				this.diplomacy = Math.max(this.diplomacy - upgrade.diplomacyLoss, 0);
			}
			this.diplomacyUpgradeList.splice(index, 1);
			this.diplomacyUpgradeList = [...this.diplomacyUpgradeList];

			this.diplomacyEvent(og, this.diplomacy);
		}
	}

	diplomacyEvent(before: number, after: number){
		var beforeFloor = Math.floor(before/100);
		var afterFloor = Math.floor(after/100)
		if (beforeFloor < afterFloor){ //100 is threshold for now
			for (let index = beforeFloor; index < afterFloor; index++) {
				var event = this.diplomacyEventPool["good"][Math.floor(Math.random() * this.diplomacyEventPool["good"].length)];
				event.effect(this);
				this.diplomacyEventStrings.push(event.eventString);
				this.diplomacyEventStrings = [... this.diplomacyEventStrings];

				setTimeout(() => {
					const index = this.diplomacyEventStrings.indexOf(event.eventString);
					if (index !== -1) {
						this.diplomacyEventStrings.pop();
						this.diplomacyEventStrings = [... this.diplomacyEventStrings];
					}
				}, 10000);
			}
		}
		else if (beforeFloor > afterFloor){ //if you DECREASED!
			for (let index = beforeFloor; index > afterFloor; index--) {
				var event = this.diplomacyEventPool["bad"][Math.floor(Math.random() * this.diplomacyEventPool["bad"].length)];
				event.effect(this);
				this.diplomacyEventStrings.push(event.eventString);
				this.diplomacyEventStrings = [... this.diplomacyEventStrings];

				setTimeout(() => {
					const index = this.diplomacyEventStrings.indexOf(event.eventString);
					if (index !== -1) {
						this.diplomacyEventStrings.pop();
						this.diplomacyEventStrings = [... this.diplomacyEventStrings];
					}
				}, 10000);
			}
		}
		else{
			return;
		}
	}

	refreshDiplomacyUpgrades(amount: number) {
		if (this.diplomacy >= 1000) return;
		const shuffled = [...this.diplomacyUpgradesStatic];

		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		this.diplomacyUpgradeList = shuffled.slice(0, amount);
	}

	initializeDiplomacyUpgrades() {
		this.diplomacyUpgradesStatic.push({
			desc: "Shake hands with the president",
			cost: 1000,
			successRate: 90,
			diplomacyIncrease: 50,
			diplomacyLoss: 20
		})
		this.diplomacyUpgradesStatic.push({
			desc: "Try to blow up their goverment building",
			cost: 1000,
			successRate: 1,
			diplomacyIncrease: 1000,
			diplomacyLoss: 1000
		})
		this.diplomacyUpgradesStatic.push({
			desc: "Put out a video glazing their president",
			cost: 2000,
			successRate: 70,
			diplomacyIncrease: 50,
			diplomacyLoss: 20
		})
		this.diplomacyUpgradesStatic.push({
			desc: "Send the president a corn dog",
			cost: 500,
			successRate: 60,
			diplomacyIncrease: 20,
			diplomacyLoss: 5
		})
	}
	
	diplomacyEventPool: Record<"good" | "bad", IDiplomacyEvent[]> = {
		good: [
			{
				eventString: "Signed a trade agreement! Tax decrease",
				effect(country: Country) {
					country.taxRate *= 9/10;
				}
			},
			{
				eventString: "The president loves you! Tax decrease",
				effect(country: Country) {
					country.taxRate *= 9/10;
				}
			}
		],
		bad: [
			{
				eventString: "Diplomatic incident with customs... Tax increase",
				effect(country: Country) {
					country.taxRate *= 10/9;
				}
			},
			{
				eventString: "Leaked documents harm reputation... Tax increase",
				effect(country: Country) {
					country.taxRate *= 10/9;
				}
			}
		]
	};
	  
	  
}