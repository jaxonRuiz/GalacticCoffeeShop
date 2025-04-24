import { get, type Writable, writable } from "svelte/store";

export class UIManager {
	coffeeGenerator: CoffeeGenerator;

	get coffees() {
		return this.coffeeGenerator.coffees;
	}

	constructor() {
		this.coffeeGenerator = new CoffeeGenerator([]);
	}

	setCoffeeLocations(loc: number[][]) {
		this.coffeeGenerator.updateLocations(loc);
	}

	coffeeMade(totalCoffees: number) {
		console.log("coffee made", totalCoffees);
		const currCoffee = this.coffeeGenerator.coffeeCount;
		for (let i = 0; i < Math.floor(totalCoffees - currCoffee); ++i) {
			this.coffeeGenerator.addCoffee();
		}
	}

	coffeeSold() {
		// TODO will need to update if coffee sell unit > 1
		// remove customer
		this.coffeeGenerator.removeCoffee();
	}
}

class CoffeeGenerator {
	loc: number[][];
	coffees: Writable<number[][]>;
	overflow: number = 0;
	
	get coffeeCount () {
		return get(this.coffees).length;
	}

	constructor(allLoc: number[][]) {
		this.loc = allLoc;
		this.coffees = writable([]);
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
