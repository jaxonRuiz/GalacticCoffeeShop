import { get, type Writable, writable } from "svelte/store";
import { Publisher } from "./observer";
import { Timer } from "./time";
import { Preshop } from "../classes/preshop";
import { MultiShop } from "../classes/multiShop";
import { Franchise } from "../classes/franchise/franchise";

export class StageManager extends Publisher {
	currentScene: IScene = {} as IScene;

	w_currentSceneIndex: Writable<number> = writable(0);
	get currentSceneIndex() {
		return get(this.w_currentSceneIndex);
	}
	set currentSceneIndex(value) {
		this.w_currentSceneIndex.set(value);
	}

	timer: Timer;

	constructor(timer: Timer) {
		super(["nextScene"]);
		this.timer = timer;
		this.subscribe(this.sceneWatcher, "nextScene");
	}

	reset(timer: Timer) {
		this.timer = timer;
		console.log("resetting stage manager");
		this.currentScene = {} as IScene;
		this.currentSceneIndex = 0;
	}

	// specifically handles loading stages from save state
	loadStage(stageIndex: number, loadState: boolean = true) {
		// if changing stages necessary
		if (stageIndex != this.currentSceneIndex) {
			this.currentSceneIndex = stageIndex;
			switch (this.currentSceneIndex) {
				case 0:
					console.log("beginning of game reload");
					break;
				case 1:
					console.log("loading preshop");
					this.currentScene = new Preshop(this.timer.timeEvents, this);
					break;
				case 2:
					console.log("loading multishop");
					this.currentScene = new MultiShop(this.timer.timeEvents, this);
					break;
				case 3:
					console.log("loading franchise");
					this.currentScene = new Franchise(this.timer.timeEvents, this);
					break;
				case 4:
					console.log("game over reload");
					break;
				default:
					console.log("game is over relaod");
			}
		}

		if (loadState) {
			console.log("loading current scene state");
			this.currentScene.loadState();
		}
	}

	sceneWatcher: ISubscriber = {
		notify: (event: string, data?: any) => {
			console.log("triggering next scene");
			this.nextScene();
		},
	};

	// specifically handles transitioning from one scene to another
	nextScene() {
		switch (this.currentSceneIndex) {
			case 0: // start game to preshop
				console.log("setting preshop");
				this.currentScene = new Preshop(this.timer.timeEvents, this);
				this.currentSceneIndex = 1;
				break;

			case 1: // preshop to multishop
				console.log("preshop to multishop");
				let preshopTransferData = this.currentScene.getTransferData();
				this.currentScene = new MultiShop(this.timer.timeEvents, this);
				this.currentScene.loadTransferData(preshopTransferData);
				this.currentSceneIndex = 2;
				break;

			case 2: // multishop to franchise
				console.log("multishop to franchise");
				let multishopTransferData = this.currentScene.getTransferData();
				this.currentScene = new Franchise(this.timer.timeEvents, this);
				this.currentScene.loadTransferData(multishopTransferData);
				this.currentSceneIndex = 3;
				break;

			case 3: // franchise to game over
				console.log("franchise to game over");
				break;

			default:
				console.log("game is over");
		}
		console.log("currently scene index: ", this.currentSceneIndex);
	}
}
