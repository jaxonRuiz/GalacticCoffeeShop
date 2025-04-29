<script lang="ts">
	import { t } from "svelte-i18n";
	import { stageManager } from "$lib/backend/game";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import Button from "$lib/components/Button.svelte";
	import { writable } from "svelte/store";

	// base
	let smanager = stageManager;
	let franchise = smanager.currentScene as Franchise;
	let country = franchise.w_currentCountry;

	// define variables
	let taxRate = $country?.w_taxRate;
	let tariffRate = $country?.w_tariffRate;
	let regions = $country?.w_regionList;
	let money = franchise.w_money;
	let dUpgrades = $country?.w_diplomacyUpgradeList ?? writable([]);
	let diplomacy = $country?.w_diplomacy ?? writable(0);
	let eventList = $country?.w_diplomacyEventStrings ?? writable("");
</script>

<div class = "money">💰 ${$money}</div>

<div class="country row">
	<div class="left block">
		<div class="block">
			<h1>Stats</h1>
			<p style="font-size: 1.2rem;">Tax rate: {$taxRate}</p>
			<p style="font-size: 1.2rem;">Tariff rate: {$tariffRate}</p>
		</div>
		<div class = "block">
			{#if $country}
				<h2>Diplomacy (need 500+ to buy regions)</h2>
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
							width: {Math.min($diplomacy / 1000 * 100, 100)}%;
							height: 100%;
							background-color: {$diplomacy >= 500 ? 'green' : 'orange'};
							transition: width 0.3s;
						"
					></div>
				</div>
				<p>{$diplomacy} / 1000</p>
			{/if}
		</div>
		<div class="block">
			<h1>Be a Diplomat!</h1>
		
			{#if dUpgrades}
				{#each $dUpgrades as upgrade, i}
					<div class="upgrade-card">
						<p><strong>{upgrade.desc}</strong></p>
						<p>💰 Cost: {upgrade.cost}</p>
						<p>🎯 Success Rate: {upgrade.successRate}%</p>
						<p>📈 Diplomacy Gain: +{upgrade.diplomacyIncrease}</p>
						<p>📉 Diplomacy Loss on Fail: -{upgrade.diplomacyLoss}</p>
						<Button onclick={() => franchise.attemptDiplomacyUpgrade(i)}>
							Attempt
						</Button>
					</div>
				{/each}
			{/if}
		</div>
		
		<div class= "block">
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
	
	<div class="center-column">
		<div class="right block">
			<h1>Country</h1>
		
			{#if $regions}
				{#each $regions as region, i (region)}
					<Button
						onclick={() => { if (region.unlocked) franchise.selectRegion(region); }}
						style="
							position: absolute;
							left: {region.coordinates[0]/11}%;
							top: {region.coordinates[1]/11}%;
						"
					>
						region {i + 1}
					</Button>
		
					{#if !region.unlocked}
						<Button
							onclick={() => {
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
							"
						>
							Unlock for: ${region.unlockCost}
						</Button>
					{/if}
				{/each}
			{/if}
		</div>
		
		<div class="rightright">
			<div class="block">
				<h1>Events:</h1>
				{#if eventList}
					{#each $eventList as eventString}
						<p>{eventString}</p>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.center-column {
		width: 40%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	div.left{
		width: 30%;
		height: 50vw;
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
	}
	div.right {
		position: relative; 
		width: 40vw;
		height: 40vw;
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
	}
	div.rightright{
		position: relative; 
		width: 100%;
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
	div.upgrade-card {
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
	}
</style>
