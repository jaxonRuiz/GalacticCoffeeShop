<script lang="ts">
	import { t } from "svelte-i18n";
	import { stageManager } from "$lib/backend/game";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import Button from "$lib/components/Button.svelte";

	// base
	let smanager = stageManager;
	let franchise = smanager.currentScene as Franchise;
	let country = franchise.w_currentCountry;

	// define variables
	let taxRate = $country?.w_taxRate;
	let tariffRate = $country?.w_tariffRate;
	let regions = $country?.w_regionList;
</script>

<div class="country row">
	<div class="left block">
		<h1>Stats</h1>
		<p>coordinates: {$country?.coordinates}</p>
		<p>tax rate: {$taxRate}</p>
		<p>tariff rate: {$tariffRate}</p>
		<br />
		<p>countries currently don't have a name</p>
		<br />
		<Button
			static={false}
			onclick={() => {
				franchise.deselectCountry();
			}}
		>
			deselect country
		</Button>
	</div>

	<div class="right block">
		<h1>Country</h1>
		<div class="col" style = "position: relative; width: 70vw; height: 90vh;">
			{#if $regions}
				{#each $regions as region, i (region)}
					<Button
						onclick={() => franchise.selectRegion(region)}
						style = "
							position: absolute;
							left: {region.coordinates[0]/11}%;
							top: {region.coordinates[1]/11}%;
						">
						region {i + 1}
					</Button>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	div.left,
	div.right {
		width: 70%;
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
	}
</style>
