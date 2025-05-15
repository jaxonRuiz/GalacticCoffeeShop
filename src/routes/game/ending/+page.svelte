<script>
  import { fade } from "svelte/transition";
	import { t } from "svelte-i18n";
  import { page } from "$app/state";
  import { base } from "$app/paths";
  import TextDisplay from "$lib/components/TextDisplay.svelte";
  import { goto } from "$app/navigation";

  let credits = $state(false);
</script>

{#if credits}
  <div class="cont" in:fade={{ delay: 1000 }} out:fade>
    <div class="col">
      <h1>{$t("credits")}</h1>
      <br />
      <h2>{$t("developed_by")}</h2>
      <p></p>
      <br />
      <br />
      <h2>{$t("external_collaborators")}</h2>
      <p></p>
    </div>
  </div>
{:else}
  <div class="cont" out:fade>
    <TextDisplay
      script={["outro1", "outro2", "outro3"]}
      callback={() => {
        credits = true;
				setTimeout(() => {
					console.log(page.url.pathname);
					if (page.url.pathname == `${base}/game/ending`) {
						goto(`${base}/`);
					}
				}, 10000)
      }}
    />
  </div>
{/if}

<style>
  div.cont {
    position: fixed;
    width: 100%;
    height: 100%;
  }

  .col {
    width: 60%;
    min-width: 700px;
    height: fit-content;
    margin: auto;
  }

  h1,
  h2,
  p {
    text-align: center;
  }

  br {
    margin: 2rem;
  }
</style>
