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
let gamePaused = writable(false);
export let firstTime = true;
export let stageManager = new StageManager(timer);

console.log("hello world");

// make sure startGame is only called on a new save
export function startNewGame() {
	resetState();
	console.log("starting new game");
	if (get(gamePaused)) {
		console.error("game paused on new game");
		resumeGame();
	}
	if (stageManager.currentSceneIndex == 0) {
		console.log("stage manager was at 0");
		stageManager.nextScene();
	} else {
		console.error("stage manager was not at 0, resetting to 0 - this should not happen, alert jaxon");
		stageManager.currentSceneIndex = 0;
		stageManager.nextScene();
	}
}

export function saveState() {
	console.log("game saving state");
	let saveData: SaveData = {
		currentStageIndex: stageManager.currentSceneIndex,
		timeData: timer.exportTimeData()
	};
	stageManager.currentScene.saveState();
	localStorage.setItem("GameSaveData", JSON.stringify(saveData));
}

export function loadState() {
	console.log("game loading state");
	if (get(gamePaused)) {
		console.error("game paused on load game");
		resumeGame();
	}
	if (!localStorage.getItem("GameSaveData")) {
		console.error("No save data found");
		startNewGame();
		return;
	}
	let saveData = JSON.parse(localStorage.getItem("GameSaveData")!);
	stageManager.loadStage(saveData.currentStageIndex);
	timer.loadTimeData(saveData.timeData);
}

export function resetState() {
	console.log("game reset state");
	localStorage.removeItem("GameSaveData");
	localStorage.removeItem("multishop");
	localStorage.removeItem("preshop");

	// reset variables to erase data inside them
	timer = new Timer();
	// stageManager = new StageManager(timer);
	stageManager.reset(timer);
}

// also acts as unpause game
export function pauseGame() {
	if (!get(gamePaused)) {
		gamePaused.set(true);
		timer.pause();
	} else console.log("game already paused");
}

export function resumeGame() {
	if (get(gamePaused)) {
		gamePaused.set(false);
		timer.resume();
	} else console.log("game already unpaused");
}

interface SaveData {
	currentStageIndex: number;
	timeData: TimeData
}

globalThis.addEventListener("beforeunload", function () {
	if (stageManager.currentSceneIndex != 0)
		saveState();
});