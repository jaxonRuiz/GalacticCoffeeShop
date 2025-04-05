<script lang="ts">
  import Preshop from "./frontend/pages/Preshop.svelte";
  import Shop from "./frontend/pages/Shop.svelte";
  import Test from "./frontend/pages/Test.svelte";
  import Multishop from "./frontend/pages/Multishop.svelte";
  import { MultiShop } from "./backend/classes/multiShop";
  import Game from "./frontend/pages/Game.svelte";
  import "@fontsource/syne-mono";
  import { pointerStyle } from "./frontend/components/Styles.svelte";
  import { booped, boops } from "./frontend/components/Boops";
  import Boops from "./frontend/components/Boops.svelte";
  import {
    saveState,
    loadState,
    resetState,
    stageManager,
  } from "./backend/game";

  let tabs = ["game", "preshop", "shop", "multishop", "test"];
  // let comps = [Game, Preshop, Multishop, Multishop, Test];
  let comps = [Game, Game, Game, Game, Test];
  let currentTab = $state(0);
  const smanager = stageManager;
  let testing = $state(false); // open testing window

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "t") {
      testing = !testing;
    }
    if (event.key === "p") {
      console.log("app loading");
      loadState();
    }
    if (event.key === "o") {
      console.log("app saving");
      saveState();
    }
    if (event.key === "r") {
      resetState();
      smanager.currentSceneIndex = 0;
      currentTab = 0;
    }
    if (event.key === "4") {
      // dev key to add money, only works in valid scenes
      try {
        (smanager.currentScene as MultiShop).money += 1000;
      } catch (e) {
        console.log(e);
      }
    }
  }

  function onMouseDown(event: MouseEvent) {
    let type = "default";
    const b = (event.target as HTMLElement).closest("button");
    if (b) {
      type = b.dataset.btn ?? "button";
      if (type === "num") {
        booped(event.clientX, event.clientY, type, b.dataset.num!);
        return;
      }
    }
    booped(event.clientX, event.clientY, type);
  }
</script>

<svelte:window onkeydown={onKeyDown} onmousedown={onMouseDown} />

<main class="fl" style={pointerStyle}>
  <div id="test-window" style="display: {testing ? 'grid' : 'none'};">
    <div id="tabs" class="col">
      {#each tabs as tab, i}
        <label class="tab">
          <input
            type="radio"
            name="tab"
            value={i}
            bind:group={currentTab}
            onclick={() => {
              switch (i) {
                case 0:
                  // game
                  smanager.loadStage(0, false);
                  break;
                case 1:
                  // preshop
                  smanager.loadStage(1, false);
                  break;
                case 2:
                  // shop
                  smanager.loadStage(2, false);
                  break;
                case 3:
                  // multishop
                  smanager.loadStage(2, false);
                  (smanager.currentScene as MultiShop).finishedFirstShop = true;
                  (
                    smanager.currentScene as MultiShop
                  ).shops[0].multiShopUnlocked = true;
                  break;
                case 4:
                  smanager.loadStage(4, false);
                  break;
              }
              if (i != 3) smanager.loadStage(i, false);
              testing = false;
            }}
          />
          <p>{tab}</p>
        </label>
      {/each}
    </div>
  </div>
  <div id="mouse-effects">
    {#each $boops as b (b.id)}
      <Boops x={b.x} y={b.y} type={b.type} numerical={b.num} />
    {/each}
  </div>
  {#if currentTab > -1}
    {@const Comp = comps[currentTab]}
    <Comp />
  {/if}
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    font-family: "Syne Mono", monospace;
    cursor: var(--cdefault), default;
  }

  /* temporary stuffs */
  label:has(input:checked) {
    background-color: #242424;
  }

  #mouse-effects {
    position: fixed;
    z-index: 500;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  #test-window {
    position: fixed;
    background-color: #00000088;
    z-index: 100;
    width: 100%;
    height: 100%;
    display: grid;
    #tabs {
      place-self: center;
      background-color: #000000;
      border: none;
      justify-content: space-around;
      input {
        display: none;
      }
      label {
        cursor: pointer;
        padding: 0.5em 4em;
      }
    }
  }
</style>
