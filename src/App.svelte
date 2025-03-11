<script lang="ts">
  import Preshop from "./frontend/pages/Preshop.svelte";
  import Shop from "./frontend/pages/Shop.svelte";
  import Test from "./frontend/pages/Test.svelte";
  import Multishop from "./frontend/pages/Multishop.svelte";
  import Game from "./frontend/pages/Game.svelte";
  import "@fontsource/syne-mono";
  import { pointerStyle } from "./frontend/components/Styles.svelte";
  import { booped, boops } from "./frontend/components/Boops";
  import Boops from "./frontend/components/Boops.svelte";
  import { saveState, loadState, resetState } from "./backend/game";

  let tabs = ["game", "preshop", "shop", "multishop", "test"];
  let comps = [Game, Preshop, Shop, Multishop, Test];
  let currentTab = $state(0);
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
    if (event.key === "m") {
      resetState();
      currentTab = 0;
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
