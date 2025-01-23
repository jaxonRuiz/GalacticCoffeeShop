import { Observer } from "./observer";

const ticksPerHour = 16;

// currently mostly exists to track time
// also contains an observer object, so can use Timer.timeEvents.subscribe()
/* NOTES: 
*   Timer.day gives calander day
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

  tickProgress = 0;
  hour = 0;
  day = 6;
  week = 1;
  month = 1;
  year = 1999; // will have years of 336 days (i refuse to do leap years or async months ):<
  ticker: number;
  timeEvents = new Observer();

  constructor() {
    this.ticker = setInterval(() => this.tick(), 250);
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
    this.ticker = setInterval(() => this.tick(), 250);
  }

  // getters
  get calanderDay() {
    return this.days[this.day];
  }
  
  get monthDay() {
    return this.day + this.week*7;
  }

  get numericDate() {
    return [this.day, this.week, this.month, this.year];
  }

  get printableDate() {
    return `${this.calanderDay}, ${this.monthDay+1} ${this.month+1}, ${this.year}`;
  }
}
