import { get, writable, type Writable } from "svelte/store";
import { Publisher } from "./observer";

export const ticksPerHour = 16;
export const msPerTick = 250;

// currently mostly exists to track time
// also contains an observer object, so can use Timer.timeEvents.subscribe()
/* NOTES:
 *   Timer.day gives calender day
 *   DAYS ARE 0 INDEXED
 */
export class Timer {
	days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	w_tickProgress: Writable<number> = writable(0);
	w_hour: Writable<number> = writable(0);
	w_day: Writable<number> = writable(6);
	w_week: Writable<number> = writable(2);
	w_month: Writable<number> = writable(1);
	w_year: Writable<number> = writable(1999);

	get tickProgress() {
		return get(this.w_tickProgress);
	}
	set tickProgress(value: number) {
		this.w_tickProgress.set(value);
	}
	get hour() {
		return get(this.w_hour);
	}
	set hour(value: number) {
		this.w_hour.set(value);
	}
	get day() {
		return get(this.w_day);
	}
	set day(value: number) {
		this.w_day.set(value);
	}
	get week() {
		return get(this.w_week);
	}
	set week(value: number) {
		this.w_week.set(value);
	}
	get month() {
		return get(this.w_month);
	}
	set month(value: number) {
		this.w_month.set(value);
	}
	get year() {
		return get(this.w_year);
	}
	set year(value: number) {
		this.w_year.set(value);
	}

	ticker: number;
	timeEvents: Publisher; // dont forget to subscribe relevant classes to this

	constructor() {
		this.timeEvents = new Publisher([
			"tick",
			"hour",
			"day",
			"week",
			"month",
			"year",
		]);
		this.ticker = setInterval(() => this.tick(), msPerTick);
	}

	tick() {
		this.tickProgress++;
		this.timeEvents.emit("tick");
		if (this.tickProgress >= ticksPerHour) {
			this.tickProgress = 0;
			this.hour++;
			this.timeEvents.emit("hour", this.hour);
		}
		if (this.hour >= 24) {
			this.hour = 0;
			this.day++;
			this.timeEvents.emit("day", this.day);
		}
		if (this.day >= 7) {
			this.day = 0;
			this.week++;
			this.timeEvents.emit("week", this.week);
		}
		if (this.week >= 4) {
			this.week = 0;
			this.month++;
			this.timeEvents.emit("month", this.month);
		}
		if (this.month >= 12) {
			this.month = 0;
			this.year++;
			this.timeEvents.emit("year", this.year);
		}
	}

	pause() {
		clearInterval(this.ticker);
	}

	resume() {
		this.ticker = setInterval(() => this.tick(), msPerTick);
	}

	exportTimeData(): TimeData {
		return {
			tickProgress: this.tickProgress,
			hour: this.hour,
			day: this.day,
			week: this.week,
			month: this.month,
			year: this.year,
		};
	}

	loadTimeData(data: TimeData) {
		this.tickProgress = data.tickProgress;
		this.hour = data.hour;
		this.day = data.day;
		this.week = data.week;
		this.month = data.month;
		this.year = data.year;
	}

	// getters
	get calanderDay() {
		return this.days[this.day];
	}

	get monthDay() {
		return this.day + this.week * 7;
	}

	get numericDate() {
		return {
			tickProgress: this.tickProgress,
			hour: this.hour,
			day: this.day,
			week: this.week,
			month: this.month,
			year: this.year,
		}
	}

	get printableDate() {
		return `${this.calanderDay}, ${this.monthDay + 1} ${this.month + 1
			}, ${this.year}`;
	}
}
