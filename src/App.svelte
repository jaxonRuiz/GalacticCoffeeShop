<script lang="ts">
  import PlanetInfo from "./components/PlanetInfo.svelte";
  import Preshop from "./components/Preshop.svelte";
  import ShopInfo1 from "./components/ShopInfo1.svelte";
  import ShopInfo2 from "./components/ShopInfo2.svelte";
  import Test from "./components/Test.svelte";

  let tabs = ["preshop", "test", "planet", "shop v1", "shop v2"];
  let comps = [Preshop, Test, PlanetInfo, ShopInfo1, ShopInfo2];
  let currentTab = $state(0);
</script>

<main class="fl">
  <div id="tabs" class="row">
    {#each tabs as tab, i}
      <label class="tab">
        <input type="radio" name="tab" value={i} bind:group={currentTab} />
        <p>{tab}</p>
      </label>
    {/each}
  </div>
  <svelte:component this={comps[currentTab]} />
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
  }

  /* temporary stuffs */
  #tabs input {
    display: none;
  }
  #tabs label {
    cursor: pointer;
    padding: 0.5em 4em;
  }
  label:has(input:checked) {
    background-color: #242424;
  }
  #tabs {
    background-color: #111;
    border: none;
    justify-content: space-around;
  }
</style>
