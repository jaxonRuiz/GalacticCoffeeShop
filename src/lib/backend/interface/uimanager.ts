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

	newCustomer(totalCustomers: number) {
		console.log("new customer", totalCustomers);
		const currAliens = this.alienGenerator.alienCount;
		for (let i = 0; i < Math.floor(totalCustomers - currAliens); ++i) {
			console.log('adding alien');
			this.alienGenerator.addAlien();
		}
	}

	customerLeaving() {
		// TODO will break if customers left > 1
		this.alienGenerator.removeAlien();
	}

	coffeeMade(totalCoffees: number) {
		const currCoffee = this.coffeeGenerator.coffeeCount;
		for (let i = 0; i < Math.floor(totalCoffees - currCoffee); ++i) {
			this.coffeeGenerator.addCoffee();
		}
	}

	coffeeSold() {
		// TODO will need to update if coffee sell unit > 1
		this.customerLeaving();
		this.coffeeGenerator.removeCoffee();
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
		if (this.coffeeCount == this.loc.length) {
			this.overflow++;
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
		if (this.overflow > 0) {
			this.overflow--;
			setTimeout(() => {
				this.addCoffee();
			}, 200);
		}
	}
}

const aTypeCounts: { [key: string]: number } = {
	"catorbiter": 4,
}

class AlienGenerator {
	aliens: Writable<[string, number][]> = writable([]);
	alienTypes: string[];
	overflow: number = 0;
	maxAliens: number;

	get alienCount() {
		return get(this.aliens).length;
	}

	constructor(types: string[], maxAliens: number = 5) {
		this.alienTypes = types;
		this.maxAliens = maxAliens;
	}

	updateTypes(types: string[]) {
		this.alienTypes = types;
	}

	addAlien() {
		if (this.alienCount == this.maxAliens) {
			this.overflow++;
			return;
		}
		this.aliens.update((aliens) => {
			const type = this.alienTypes[Math.floor(Math.random() * this.alienTypes.length)];
			console.log(type, aTypeCounts[type], Math.floor(Math.random() * aTypeCounts[type]));
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
		if (this.overflow > 0) {
			this.overflow--;
			this.addAlien();
		}
	}
}