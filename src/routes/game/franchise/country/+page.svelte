<script lang="ts">
	import { t } from "svelte-i18n";
	import { stageManager } from "$lib/backend/game";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";

	// base
	let smanager = stageManager;
	let franchise = smanager.currentScene as Franchise;
	let country = franchise.w_currentCountry;

	// define variables
	let taxRate = $country!.w_taxRate;
	let tariffRate = $country!.w_tariffRate;
	let regions = $country!.w_regionList;
</script>

<div class="country row">
	<div class="left">
		<h1>Stats</h1>
		<p>coordinates: {$country!.coordinates}</p>
		<p>tax rate: {$taxRate}</p>
		<p>tariff rate: {$tariffRate}</p>
	</div>

	<div class="right">
		<h1>Region List</h1>
		{#each $regions as region, i (region)}
			<p>region {i + 1}</p>
		{/each}
	</div>
</div>

<style>
	div.left,
	div.right {
		width: 50%;
	}
</style>
