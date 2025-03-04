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

// make sure startGame is only called on a new save
export function startGame() {
	console.log("starting game");
	stageManager.nextScene();
	// stageManager.loadStage(2);
}

function saveState() {
	let saveData: SaveData = {
		currentStageIndex: stageManager.currentSceneIndex,
	};

	localStorage.setItem("GameSaveData", JSON.stringify(saveData));
}

function loadState() {
	let saveData = JSON.parse(localStorage.getItem("GameSaveData")!);
	stageManager.loadStage(saveData.currentStageIndex);
}

interface SaveData {
	currentStageIndex: number;
}
