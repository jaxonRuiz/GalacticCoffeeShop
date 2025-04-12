import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { UpgradeManager } from "../../systems/upgradeManager";
import { AudioManager } from "../../systems/audioManager";
import { World } from "./world";


export class Franchise implements ISubscriber, IScene {
  // writable resources
  w_money: Writable<number> = writable(0);

  // writable getters/setters
  get money() {
    return get(this.w_money);
  }
  set money(value) {
    this.w_money.set(value);
  }

  // internal stats ////////////////////////////////////////////////////////////

  sceneManager: Publisher;
  audioManager: AudioManager = new AudioManager();
  world: World = new World();

  constructor(timer: Publisher, sceneManager: Publisher) {
    console.log("franchise constructor()");
    timer.subscribe(this, "tick");
    this.sceneManager = sceneManager;

  }

  notify(event: string, data?: any) {
  }

  tick() {
    this.world.tick();
  }

  // franchise actions /////////////////////////////////////////////////////////
  // stuff the player can do


  // end scene ////////////////////////////////////////////////////////////////
  endScene() {
    console.log("franchise stage endScene()");

  }

  getTransferData() {
    return {};
  }

  loadTransferData() {

  }

  // save state ////////////////////////////////////////////////////////////////
  saveState() {
    console.log("franchise stage saveState()");

  }

  loadState() {
    console.log("franchise stage loadState()");

  }

  clearState() { }
}