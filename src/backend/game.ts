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
export let firstTime = true;
export let stageManager = new StageManager(timer);

console.log("hello world");

// make sure startGame is only called on a new save
export function startNewGame() {
	console.log("starting game");
	stageManager.nextScene();
}

export function saveState() {
	console.log("game saving state");
	let saveData: SaveData = {
		currentStageIndex: stageManager.currentSceneIndex,
	};
	stageManager.currentScene.saveState();
	localStorage.setItem("GameSaveData", JSON.stringify(saveData));
}

export function loadState() {
	console.log("game loading state");
	if (!localStorage.getItem("GameSaveData")) {
		console.log("No save data found");
	}
	let saveData = JSON.parse(localStorage.getItem("GameSaveData")!);
	stageManager.loadStage(saveData.currentStageIndex);
}

export function resetState() {
	console.log("game reset state");
	localStorage.removeItem("GameSaveData");
	localStorage.removeItem("multishop");
	localStorage.removeItem("preshop");
}

interface SaveData {
	currentStageIndex: number;
}
