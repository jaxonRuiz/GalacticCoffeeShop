<script lang="ts">
  import { stageManager } from "../../backend/game";
  import Multishop from "./Multishop.svelte";
  import Preshop from "./Preshop.svelte";
  import Intro from "./Intro.svelte";
	import { Preshop as IPreshop } from "../../backend/classes/preshop";
	import { MultiShop as IMultishop } from "../../backend/classes/multiShop";

	const smanager = stageManager;

	const stage = smanager.w_currentSceneIndex;

	function on_key_down(event: KeyboardEvent) {
		console.log(event.key);
	}
</script>

<svelte:window onkeydown={on_key_down} />

{#if $stage == 0}
	<Intro />
{:else if $stage == 1}
	<Preshop wshop={smanager.currentScene as IPreshop} />
{:else if $stage == 2}
	<Multishop wshop={smanager.currentScene as IMultishop} />
{/if}

