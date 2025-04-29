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
	let money = franchise.w_money;
</script>

<div class = "money">💰 ${$money}</div>

<div class="country row">
	<div class="left block">
		<div class="block">
			<h1>Stats</h1>
			<p>coordinates: {$country?.coordinates}</p>
			<p>tax rate: {$taxRate}</p>
			<p>tariff rate: {$tariffRate}</p>
			<br />
			<p>countries currently don't have a name</p>
			<br />
			{#if $country}
				<h2>Diplomacy</h2>
				<div
					style="
						width: 100%;
						height: 24px;
						background-color: #ddd;
						border-radius: 12px;
						overflow: hidden;
						margin-bottom: 4px;
					"
				>
					<div
						style="
							width: {Math.min($country.diplomacy / 1000 * 100, 100)}%;
							height: 100%;
							background-color: {$country.diplomacy >= 500 ? 'green' : 'orange'};
							transition: width 0.3s;
						"
					></div>
				</div>
				<p>{$country.diplomacy} / 1000</p>
			{/if}
	
			<Button
				static={false}
				onclick={() => {
					franchise.deselectCountry();
				}}
			>
				deselect country
			</Button>
		</div>
	</div>
	
	<div class="right block">
		<h1>Country</h1>
		<div class="col" style = "position: relative; width: 70vw; height: 90vh;">
			{#if $regions}
				{#each $regions as region, i (region)}
					<Button
						onclick={() => {if (region.unlocked) franchise.selectRegion(region);}}
						style = "
							position: absolute;
							left: {region.coordinates[0]/11}%;
							top: {region.coordinates[1]/11}%;
						">
						region {i + 1}
					</Button>

					{#if !region.unlocked}
						<Button
							on:click={() => {
								if (region.parentCountry.diplomacy >= 500) {
									franchise.buyRegion(region);
									region.unlocked = true;
								}
							}}
							disabled={region.parentCountry.diplomacy < 500}
							style="
								position: absolute;
								left: {region.coordinates[0] / 11}%;
								top: {region.coordinates[1] / 11 + 4}%;
								background-color: {region.parentCountry.diplomacy < 500 ? '#aaa' : 'green'};
								color: white;
								cursor: {region.parentCountry.diplomacy < 500 ? 'not-allowed' : 'pointer'};
							">
							Buy for: ${region.unlockCost}
						</Button>
					{/if}
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
	div.block {
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
	}
	div.money {
		position: fixed;
		top: 30px;
		right: 60px;
		background-color: #222;
		color: white;
		padding: 10px 16px;
		border-radius: 8px;
		box-shadow: 0 0 10px rgba(0,0,0,0.3);
		font-weight: bold;
		z-index: 1000;
	}
</style>
