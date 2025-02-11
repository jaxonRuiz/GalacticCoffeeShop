<script lang="ts">
  import Preshop from "./frontend/pages/Preshop.svelte";
  import Shop from "./frontend/pages/Shop.svelte";
  import Test from "./frontend/pages/Test.svelte";

  let tabs = ["preshop", "shop", "test"];
  let comps = [Preshop, Shop, Test];
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
    background-color: #000000aa;
    border: none;
    justify-content: space-around;
    width: 100%;
    position: fixed;
  }
</style>
