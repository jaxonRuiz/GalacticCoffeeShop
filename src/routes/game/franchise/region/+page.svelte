<script lang="ts">
	import { t } from "svelte-i18n";
	import { stageManager } from "$lib/backend/game";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import Development from "$lib/components/Development.svelte";
	import Button from "$lib/components/Button.svelte";

	// base
	const smanager = stageManager;
	const franchise: Franchise = smanager.currentScene as Franchise;
	let region = franchise.w_currentRegion;

	// define variables
	let money = franchise.w_money;
	let totalArea = $region?.w_totalArea;
	let unusedLand = $region?.w_unusedLand;
	let devlopmentList = $region?.w_developmentList;
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
	let researchersPD = $region?.w_researchersPerDay;
	let researchers = franchise.w_researchers;
	let popDiv = franchise.w_populationDivisor;
	let coffeeMult = franchise.w_coffeeMultiplier;
</script>

<div class = "money">💰 ${$money}</div>

<div class="region row">
	<div class="left block">
		<div class = "stats">
			<h1>Rates</h1>
			<p>Coffees sold last hour: {$coffeeSold}</p>
			<p>Max coffees/hour: {$maxCoffee}</p>
			<p>Beans/hour: {($beansPerHour ?? 0) * $coffeeMult}</p>
			<p>Gallons of water/hour: {$waterPerHour}</p>
			<p>Estimated customers/hour: {($population ?? 0) / $popDiv}</p>
			<p>Researchers/day: {$researchersPD}</p>
		</div>
		<div class = "stats">
			<h1>Stats</h1>
			<p>total area: {$totalArea} acres</p>
			<p>unused land: {$unusedLand}</p>
			<p>accessibility level: {$accessibilityLevel}</p>
			<p>import capacity: {$importCapacity}</p>
			<p>export capacity: {$exportCapacity}</p>
			<p>beans: {$beans}</p>
			<p>water: {$water}</p>
			<p>population: {$population}</p>
			<p>Researchers: {$researchers}</p>
		</div>
		<div class = "env">
			{#if $environmentalFactors}
				<h1>Environment</h1>
				<p>soil richness: {$environmentalFactors.soilRichness}</p>
				<p>water availability: {$environmentalFactors.waterAvailability}</p>
				<p>average temperature: {$environmentalFactors.averageTemp}</p>
			{/if}
		</div>
		<br />

		<p>regions currently don't have a name</p>

		<br />
		<Button
			static={false}
			onclick={() => {
				franchise.deselectRegion();
			}}>deselect region</Button
		>
	</div>

	<div class="right block">
		{#if $devlopmentList}
			<h1>Developments</h1>
			<div class="col scroll">
				{#each Object.keys($devlopmentList) as key (key)}
					<Development dev={$devlopmentList[key]} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	div.left{
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
	.col.scroll {
		overflow-y: auto;
		max-height: 100%;
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
