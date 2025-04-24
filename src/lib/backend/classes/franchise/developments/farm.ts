import { get, type Writable, writable } from "svelte/store";
import { DevelopmentBase, DevelopmentType } from "./developmentbase";
import type { Publisher } from "$lib/backend/systems/observer";
import type { Region } from "../region";
import type { Franchise } from "../franchise";

export class Farm extends DevelopmentBase {
	get developmentType(): DevelopmentType {
		return DevelopmentType.Farm;
	}

	w_water: Writable<number> = writable(0);

	get water() {
		return get(this.w_water);
	}
	set water(value) {
		this.w_water.set(value);
	}

	constructor(timer: Publisher, region: Region, areaSize: number, franchise: Franchise) {
		super(timer, region, areaSize, franchise);
		this.initializeDevelopment();
	}

	initializeDevelopment(): void {
		//put all the city specific initializations in here; much will be procedurally generated based on parent region's environment/allocated area size
		const self = this;
		if (this.franchise.firstFarm){
			this.buyBuilding({
				name: "Greenhouse",
				desc: "Grow some beans",
				areaSize: 3,
				buyCost: 0,
				sellCost: 600 - Math.floor(Math.random() * 100),
				rent: 100,
				beansPerHour: 30 +
					Math.floor((Math.random() * 20) *
						this.parent.environmentalFactors["soilRichness"]),
				onBuy: function () {
				},
				onSell: function () {
				},
				onTick: function () {
				},
				onHour: function () {
					var b = Math.min(this.beansPerHour, self.water);
					self.parent.beans += b;
					self.water -= b;
				},
				onDay: function () {
					self.franchise.money -= this.rent;
				},
				onWeek: function () {
				},
				whatDo: function (): string {
					return `Grows ${this.beansPerHour} beans per hour`;
				}
			} as FarmBuilding);
			this.buyBuilding(({
				name: "Water Tower",
				desc: "Hope you're thirsty",
				areaSize: 2,
				buyCost: 0,
				sellCost: 800 - Math.floor(Math.random() * 100),
				rent: 100,
				waterPerHour: Math.floor(50 * this.parent.environmentalFactors["waterAvailability"]),
				onBuy: function () {
				},
				onSell: function () {
				},
				onTick: function () {
				},
				onHour: function () {
					self.water += this.waterPerHour;
				},
				onDay: function () {
					self.franchise.money -= this.rent;
				},
				onWeek: function () {
				},
				whatDo: function (): string {
					return `Produces ${this.waterPerHour} water per hour`;
				}
			} as WaterBuilding))
			this.franchise.firstFarm = false;
		}
		
		this.updateAvailableBuildings(3); //these should be displayed on the frontend
	}

	updateAvailableBuildings(buildingCount: number): void {
		const self = this;
		this.availableBuildings = [];

		let possibleBuildings = [];
		possibleBuildings.push({
			name: "Water Tower",
			desc: "Hope you're thirsty",
			areaSize: 2,
			buyCost: 2000 + Math.floor(Math.random() * 1000),
			sellCost: 2000 - Math.floor(Math.random() * 500),
			rent: 200,
			waterPerHour: Math.floor(50 * this.parent.environmentalFactors["waterAvailability"]),
			onBuy: function () {
			},
			onSell: function () {
			},
			onTick: function () {
			},
			onHour: function () {
				self.water += this.waterPerHour;
			},
			onDay: function () {
				self.franchise.money -= this.rent;
			},
			onWeek: function () {
			},
			whatDo: function (): string {
				return `Produces ${this.waterPerHour} water per hour`;
			}
		} as WaterBuilding);

		possibleBuildings.push({
			name: "Large Water Tower",
			desc: "Hope you're super thirsty",
			areaSize: 3,
			buyCost: 3000 + Math.floor(Math.random() * 1000),
			sellCost: 3000 - Math.floor(Math.random() * 500),
			rent: 300,
			waterPerHour: Math.floor(100 * this.parent.environmentalFactors["waterAvailability"]),
			onBuy: function () {
			},
			onSell: function () {
			},
			onTick: function () {
			},
			onHour: function () {
				self.water += this.waterPerHour;
			},
			onDay: function () {
				self.franchise.money -= this.rent;
			},
			onWeek: function () {
			},
			whatDo: function (): string {
				return `Produces ${this.waterPerHour} water per hour`;
			}
		} as WaterBuilding);

		possibleBuildings.push({
			name: "Greenhouse",
			desc: "Grow some beans",
			areaSize: 3,
			buyCost: 3000 + Math.floor(Math.random() * 1000),
			sellCost: 3000 - Math.floor(Math.random() * 500),
			rent: 200,
			beansPerHour: 30 +
				Math.floor((Math.random() * 20) *
					this.parent.environmentalFactors["soilRichness"]),
			onBuy: function () {
			},
			onSell: function () {
			},
			onTick: function () {
			},
			onHour: function () {
				var b = Math.min(this.beansPerHour, self.water);
				self.parent.beans += b;
				self.water -= b;
			},
			onDay: function () {
				self.franchise.money -= this.rent;
			},
			onWeek: function () {
			},
			whatDo: function (): string {
				return `Grows ${this.beansPerHour} beans per hour`;
			}
		} as FarmBuilding);

		possibleBuildings.push({
			name: "Field",
			desc: "Grow loads of beans",
			areaSize: 5,
			buyCost: 4000 + Math.floor(Math.random() * 1000),
			sellCost: 4000 - Math.floor(Math.random() * 500),
			rent: 300,
			beansPerHour: 50 +
				Math.floor((Math.random() * 30) *
					this.parent.environmentalFactors["soilRichness"]),
			onBuy: function () {
			},
			onSell: function () {
			},
			onTick: function () {
			},
			onHour: function () {
				var b = Math.min(this.beansPerHour, self.water);
				self.parent.beans += b;
				self.water -= b;
			},
			onDay: function () {
				self.franchise.money -= this.rent;
			},
			onWeek: function () {
			},
			whatDo: function (): string {
				return `Grows ${this.beansPerHour} beans per hour`;
			}
		} as FarmBuilding);

		this.availableBuildings = this.getRandomSubset(possibleBuildings, buildingCount);
		}
	
		getRandomSubset<T>(array: T[], count: number): T[] {
			const copy = [...array];
			for (let i = copy.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[copy[i], copy[j]] = [copy[j], copy[i]];
			}
			return copy.slice(0, count);
		}
}

