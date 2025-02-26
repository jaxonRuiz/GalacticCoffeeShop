import { Preshop } from "./classes/preshop";
import { Timer } from "./systems/time";
import { UpgradeManager } from "./systems/upgradeManager";
import { Tester } from "./tester";
import { Publisher } from "./systems/observer";
import { MultiShop } from "./classes/multiShop";
import { get, type Writable, writable } from "svelte/store";
import { StageManager } from "./systems/stageManager";

// let tester = new Tester();
// tester.preshopTest01();

let timer = new Timer();
export let stageManager = new StageManager(timer);

console.log("hello world");

export function startGame() {
	console.log("starting game");
	stageManager.nextScene();
}

function saveState() {
	// save state to local storage
}

function loadState() {
	// load state from local storage
}
