<script lang="ts">
  import { t } from "svelte-i18n";
  import { fade } from "svelte/transition";
  import { startNewGame } from "../../backend/game";
  import { pointerStyle } from "../components/Styles.svelte";
  import Button from "../components/Button.svelte";

  let { tutorial } = $props();

  let title = $state(true);
  let text = $state(-1);
  const script = ["intro1", "intro2", "intro3", "intro4"];
</script>

<svelte:window
  onmousedown={() => {
    if (!title) {
      text++;
      if (text >= script.length) {
        startNewGame();
      }
		}
  }}
/>

<main class="fl col {title ? 'title' : ''} {pointerStyle}" transition:fade>
  {#if title}
      <h1 transition:fade|global>{$t("gameTitle")}</h1>
      <Button
        style="width: fit-content;"
        onclick={() => {
          title = false;
          if (!tutorial) {
            startNewGame();
          } else {
						setTimeout(() => {
							text++;
						}, 700);
					}
        }}
      >
        <p>{$t("startGame_btn")}</p>
      </Button>
  {:else if text >= 0}
      {#each script as key, i (key)}
        {#if text >= i}
          <h2 class="intro" transition:fade>{$t(key)}</h2>
        {/if}
      {/each}
  {/if}
</main>

<style>
  main {
		align-items: center;
		justify-content: center;
    width: 100%;
    height: 100%;
    &:not(.title) {
      cursor: var(--cpointer), pointer;
    }
  }

  .intro {
    text-align: center;
  }
</style>
