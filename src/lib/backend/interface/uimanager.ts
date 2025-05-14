import { get, type Writable, writable } from "svelte/store";

export class UIManager {
	coffeeGenerator: CoffeeGenerator;
	alienGenerator: AlienGenerator;

	get coffees() {
		return this.coffeeGenerator.coffees;
	}

	get customers() {
		return this.alienGenerator.aliens;
	}

	constructor() {
		this.coffeeGenerator = new CoffeeGenerator([]);
		this.alienGenerator = new AlienGenerator([]);
	}

	setCoffeeLocations(loc: number[][]) {
		this.coffeeGenerator.updateLocations(loc);
	}

	setAlienTypes(types: string[]) {
		this.alienGenerator.updateTypes(types);
	}

	setCustomerCount(customers: number) {
		const currAliens = this.alienGenerator.alienCount;

		for (let i = 0; i < Math.floor(customers - currAliens); ++i) {
			this.alienGenerator.addAlien();
		}
		for (let i = currAliens; i > customers; --i) {
			this.alienGenerator.removeAlien();
		}
	}

	setCoffeeCount(coffees: number) {
		const currCoffee = this.coffeeGenerator.coffeeCount;

		for (let i = 0; i < Math.floor(coffees - currCoffee); ++i) {
			this.coffeeGenerator.addCoffee();
		}
		for (let i = currCoffee; i > coffees; --i) {
			this.coffeeGenerator.removeCoffee();
		}
	}
}

class CoffeeGenerator {
	loc: number[][];
	coffees: Writable<number[][]> = writable([]);
	overflow: number = 0;

	get coffeeCount() {
		return get(this.coffees).length;
	}

	constructor(allLoc: number[][]) {
		this.loc = allLoc;
	}

	updateLocations(loc: number[][]) {
		this.loc = loc;
		this.coffees.set([]);
	}

	addCoffee() {
		if (this.coffeeCount >= this.loc.length) {
			return;
		}
		const possLoc = this.loc.filter((loc) => {
			return !get(this.coffees).includes(loc);
		});
		this.coffees.update((coffees) => {
			const newCoffee = possLoc[Math.floor(Math.random() * possLoc.length)];
			coffees.push(newCoffee);
			return coffees;
		});
	}

	removeCoffee() {
		this.coffees.update((coffees) => {
			const newCoffees = [...coffees];
			newCoffees.shift();
			return newCoffees;
		});
	}
}

const aTypeCounts: { [key: string]: number } = {
	"catorbiter": 4,
}

class AlienGenerator {
	aliens: Writable<[string, number][]> = writable([]);
	alienTypes: string[];

	get alienCount() {
		return get(this.aliens).length;
	}

	constructor(types: string[]) {
		this.alienTypes = types;
	}

	updateTypes(types: string[]) {
		this.alienTypes = types;
	}

	addAlien() {
		this.aliens.update((aliens) => {
			const type = this.alienTypes[Math.floor(Math.random() * this.alienTypes.length)];
			aliens = [...aliens, [type, Math.floor(Math.random() * aTypeCounts[type])]];
			return aliens;
		});
	}

	removeAlien() {
		this.aliens.update((aliens) => {
			const newAliens = [...aliens];
			newAliens.shift();
			return newAliens;
		});
	}
}