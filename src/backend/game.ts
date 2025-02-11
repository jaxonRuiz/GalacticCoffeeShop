import { Preshop } from "./classes/preshop";
import { Timer } from "./systems/time";
import { UpgradeManager } from "./systems/upgradeManager";
import { Tester } from "./tester";
import { Publisher } from "./systems/observer";
import { MultiShop } from "./classes/multiShop";

// let tester = new Tester();
// tester.preshopTest01();

let timer = new Timer();
let sceneManager = new Publisher(["nextScene"]);

export let currentScene: IScene;
let sceneWatcher: ISubscriber = {
  notify: (event: string, data?: any) => {
    console.log("default watcher");
  },
};
sceneManager.subscribe(sceneWatcher, "nextScene");

console.log("hello world");
startGame();

function startGame() {
  console.log("starting game");
  startPreshop(timer);
}

function startPreshop(timer: Timer) {
  console.log("starting preshop");
  let preshopManager = new UpgradeManager("preshop");
  let preshop = new Preshop(timer.timeEvents, sceneManager);
  currentScene = preshop;

  sceneManager.unsubscribe(sceneWatcher, "nextScene");
  let preshopWatcher = {
    notify: (event: string, data?: any) => {
      if (event === "nextScene") {
        console.log("moving to multishop");
        startMultishop();
      }
    },
  };
  sceneWatcher = preshopWatcher;
  sceneManager.subscribe(preshopWatcher, "nextScene");
}

function startMultishop() {
  console.log("multishop started");
  let multiShop = new MultiShop(timer.timeEvents, sceneManager);
  currentScene = multiShop;

  sceneManager.unsubscribe(sceneWatcher, "nextScene");
  let multiShopWatcher = {
    notify: (event: string, data?: any) => {
      if (event === "nextScene") {
        
        console.log("game over");
      }
    },
  };
  sceneWatcher = multiShopWatcher;
  sceneManager.subscribe(multiShopWatcher, "nextScene");
}

function saveState() {
  // save state to local storage
}

function loadState() {
  // load state from local storage
}
