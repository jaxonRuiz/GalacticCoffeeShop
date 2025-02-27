<script lang="ts">
	import { t } from "svelte-i18n";
	import { fade } from 'svelte/transition';
	import { startGame } from "../../backend/game";
  import Button from "../components/Button.svelte";
</script>

<main class="fl" transition:fade>
	<h1>{$t("gameTitle")}</h1>
	<Button
		onclick={() => {
			startGame();
		}}
	>
		<p>{$t("startGame_btn")}</p>
	</Button>
</main>

<style>
	main {
		display: grid;
		place-content: center;
		width: 100%;
		height: 100%;
	}
</style>
