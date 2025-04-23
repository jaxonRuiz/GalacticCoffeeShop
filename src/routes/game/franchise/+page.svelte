<script lang="ts">
	import { t } from "svelte-i18n";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import { stageManager } from "$lib/backend/game";
	import Button from "$lib/components/Button.svelte";

	let franchise = stageManager.currentScene as Franchise;
	let countries = franchise.world.w_countries;
</script>

<div class="col block" style = "position: relative; height: 100vh;">
	<h1>World View</h1>
	{#each Object.keys($countries) as country (country)}
		<Button
			static={false}
			onclick={() => {
				franchise.world.selectCountry(country);
			}}
			style = "
				position: absolute;
				left: {($countries[country].coordinates[0] / 12)}%;
				top: {($countries[country].coordinates[1] / 11)}%;
			"
		>
			{country}
		</Button>
	{/each}
</div>

<style>
</style>
