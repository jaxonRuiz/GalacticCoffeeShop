import { Publisher } from "../../systems/observer";
import { get, type Writable, writable } from "svelte/store";
import { UpgradeManager } from "../../systems/upgradeManager";
import { AudioManager } from "../../systems/audioManager";


export class Franchise implements ISubscriber, IScene, IFranchise {
  // writable resources

  // writable getters/setters

  // internal stats ////////////////////////////////////////////////////////////

  sceneManager: Publisher;
  audioManager: AudioManager = new AudioManager();

  constructor(timer: Publisher, sceneManager: Publisher) {
    console.log("franchise constructor()");
    timer.subscribe(this, "tick");
    this.sceneManager = sceneManager;

  }

  notify(event: string, data?: any) {
  }

  tick() { }

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