import { Preshop } from "./classes/preshop";
import { Timer } from "./systems/time";
import { UpgradeManager } from "./systems/upgradeManager";
import { Tester } from "./tester";
import { Publisher } from "./systems/observer";

let tester = new Tester();
tester.preshopTest01();
let timer = new Timer();
let gameObserver = new Publisher(["nextScene"]);
let currentScene: string;

function startGame() {
  currentScene = "preshop";
  startPreshop(timer);
}

function startPreshop(timer: Timer) {
  let preshop = new Preshop(timer.timeEvents);
  let preshopManager = new UpgradeManager("preshop");
}

function startMultishop() {
}

function saveState() {
  // save state to local storage
}

function loadState() {
  // load state from local storage
}
