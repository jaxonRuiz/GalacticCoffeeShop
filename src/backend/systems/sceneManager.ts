import { Publisher } from "./observer";
import { get, type Writable, writable } from "svelte/store";
import { Timer } from "./time";
import { Preshop } from "../classes/preshop";
import { MultiShop } from "../classes/multiShop";

export class SceneManager extends Publisher {
  currentScene: IScene = {} as IScene;

  currentSceneIndex: number = 0;
  timer: Timer;

  constructor(timer: Timer) {
    super(["nextScene"]);
    this.timer = timer;
    this.subscribe(this.sceneWatcher, "nextScene");
  }

  sceneWatcher: ISubscriber = {
    notify: (event: string, data?: any) => {
      console.log("triggering next scene");
      this.nextScene();
    },
  };

  nextScene() {
    console.log("ending scene index: ", this.currentSceneIndex);

    switch (this.currentSceneIndex) {
      case 0: // start game to preshop
        console.log("setting preshop");
        this.currentScene = new Preshop(this.timer.timeEvents, this);
        // let tempPreshop = new Preshop(this.timer.timeEvents, this);
        // this.w_currentScene.set(tempPreshop);
        this.currentSceneIndex = 1;
        break;

      case 1: // preshop to multishop
        console.log("preshop to multishop");
        this.currentScene = new MultiShop(this.timer.timeEvents, this);
        // let tempMultishop = new MultiShop(this.timer.timeEvents, this);
        // this.w_currentScene.set(tempMultishop);
        this.currentSceneIndex = 2;
        break;

      case 2: // multishop to gameover
        console.log("multishop to game over");
        this.currentSceneIndex = 3;
        break;

      default:
        console.log("game is over");
    }
    console.log("currently scene index: ", this.currentSceneIndex);
  }
}
