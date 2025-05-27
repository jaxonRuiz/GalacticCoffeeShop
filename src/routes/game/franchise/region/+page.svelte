<script lang="ts">
	import { t } from "svelte-i18n";
	import { stageManager } from "$lib/backend/game";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import Development from "$lib/components/Development.svelte";
	import Button from "$lib/components/Button.svelte";
	import { fMoney } from "$lib/components/Styles.svelte";
	import { timer } from "$lib/backend/game";
	import Building from "$lib/components/franchise/Building.svelte";
	import { writable } from "svelte/store";

	let hour = timer.w_hour;
	let day = timer.w_day;

	// base
	const smanager = stageManager;
	const franchise: Franchise = smanager.currentScene as Franchise;
	let region = franchise.w_currentRegion;

	// define variables
	let money = franchise.w_money;
	let totalArea = $region?.w_totalArea;
	let usableLand = $region?.w_usableLand;
	let unusableLand = $region?.w_unusableLand;
	let unusableCost = $region?.w_unusableBuyCost;
	let environmentalFactors = $region?.w_environmentalFactors;
	let accessibilityLevel = $region?.w_accessibilityLevel;
	let importCapacity = $region?.w_importCapacity;
	let exportCapacity = $region?.w_exportCapacity;
	let beans = $region?.w_beans;
	let population = $region?.w_population;
	let water = $region?.w_water;
	let waterPerHour = $region?.w_waterPerHour;
	let beansPerHour = $region?.w_beansPerHour;
	let coffeeSold = $region?.w_coffeesSoldLastHour;
	let maxCoffee = $region?.w_maxCoffeePerHour;
	let researchers = franchise.w_researchers;
	let custPerHour = $region?.w_expectedCustomersPerHour;
	let delPerHour = $region?.w_deliveriesPerHour;
	let boughtBuildings = $region?.w_boughtBuildings ?? writable([]);
	let availBuildings = $region?.w_availableBuildings ?? writable([]);
</script>

<div class = "money">💰 {fMoney($money)}</div>

<Button
	static={true}
	onclick={() => {
		franchise.selectResearchLab();
	}}
>
	go to research lab
</Button>

<p style="position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2rem;
    color: white;
    padding: 0.5rem 1rem;
    z-index: 1000;">
	Day: {timer.getDay($day)} {$hour}:00
</p>

<Button
			static={false}
			onclick={() => {
				franchise.deselectRegion();
			}}>deselect region</Button
		>

<div class="region row">
	<div class="left block">
		<div class = "stats">
			<h1>Rates</h1>
			<p>Coffees sold last hour: {$coffeeSold} coffees</p>
			<p>Max coffees/hour: {$maxCoffee} coffees</p>
			<p>Beans/hour: {$beansPerHour} beans</p>
			<p>Estimated customers/hour: {Math.floor($custPerHour ?? 1)} customers</p>
		</div>
		<div class = "stats">
			<h1>Stats</h1>
			<p>Total area: {$totalArea} acres</p>
			<p>Usable land: {$usableLand} acres</p>
			<p>Unusable land: {$unusableLand} acres</p>
			<!-- <p>Accessibility level: {$accessibilityLevel}</p> -->
			<p>Import capacity: {$importCapacity} beans</p>
			<p>Export capacity: {$exportCapacity} beans</p>
			<p>Bean count: {$beans} beans</p>
			<p>Population: {$population} people</p>
			<p>Researchers: {$researchers} researchers</p>
		</div>
		<div class = "env">
			{#if $environmentalFactors}
				<h1>Environment</h1>
				<p>soil richness: {$environmentalFactors.soilRichness.toFixed(2)}</p>
				<p>water availability: {$environmentalFactors.waterAvailability.toFixed(2)}</p>
				<p>average temperature: {$environmentalFactors.averageTemp.toFixed(2)}</p>
			{/if}
		</div>
		<br>
		{#if ($unusableLand ?? 1) > 0}
			<Button onclick={() => franchise.buyUnusable()}
				disabled={$money < ($unusableCost ?? 1000)}
				style = "
					background-color: {$money < ($unusableCost ?? 1000) ? '#444' : '#515151'};
					cursor: {$money < ($unusableCost ?? 1000) ? '--cno' : '--cpointer'};
				">
				Buy unusable land for: {($unusableCost ?? 1000)}
			</Button>
		{/if}
	</div>

	<div class="right block">
		<div class="buildings-container">
			<div class="bought-dev col inner-block">
				<h3>Bought Buildings</h3>
				{#each $boughtBuildings as building, i (building)}
					<Building region = {$region} building = {building} bought = {true}></Building>
				{/each}
			</div>

			<div class="avail-dev col inner-block">
				<h3>Available Buildings (resets daily)</h3>
				{#each $availBuildings as building, i (building)}
					<Building region = {$region} building = {building} bought = {false}></Building>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	div.left{
		overflow: auto;
		width: 50%;
		height: 90vh;
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(28, 28, 28);
		box-sizing: border-box;
	}
	div.right {
		width: 50%;
		height: 90vh;
		display: flex;
		flex-direction: column;
	}
	div.stats{
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(43, 43, 43);
		box-sizing: border-box;
	}
	div.env{
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(43, 43, 43);
		box-sizing: border-box;
	}
	div.right{
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(28, 28, 28);
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
	.right.block {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.buildings-container {
		display: flex;
		flex: 1;
		gap: 1rem;
		overflow: hidden;
	}
	.col {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		min-height: 0;
		padding: 0.5rem;
	}




</style>
