<script lang="ts">
	import { t } from "svelte-i18n";
	import { stageManager } from "$lib/backend/game";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import Button from "$lib/components/Button.svelte";
	import { writable } from "svelte/store";
	import Region from "$lib/components/franchise/Region.svelte";
	import { fMoney } from "$lib/components/Styles.svelte";
	import { timer } from "$lib/backend/game";
	import RegionImportExport from "$lib/components/franchise/RegionImportExport.svelte";
	import UpgradesPanel from "$lib/components/UpgradesPanel.svelte";

	let hour = timer.w_hour;
	let day = timer.w_day;

	// base
	let smanager = stageManager;
	let franchise = smanager.currentScene as Franchise;
	let country = franchise.w_currentCountry;

	// define variables
	let taxRate = $country?.w_taxRate;
	let regions = $country?.w_regionList;
	let money = franchise.w_money;
	let influenceTasks = $country?.w_influenceTaskList ?? writable([]);
	let currinfluenceTasks = $country?.w_currInfluenceTasks ?? writable([]);
	let influence = $country?.w_influence ?? writable(0);
	let maxInfluenceTasks = $country?.w_maxInfluenceTasks;
	let policyEvents = $country?.w_policyEvents ?? writable([]);
	let unlocked = $country?.w_unlocked;
	let regionList = $country?.w_regionList ?? writable([]);
	
	let countryTotalCoffee = $country?.countryTotalCoffee;
	let countryTotalBeans = $country?.countryTotalBeans;

	let taxedMoney = franchise.w_taxedMoney;
</script>

<div class = "money">💰 {fMoney($money)}</div>
<div style="position: fixed;
		top: 30px;
		right: 250px;
		background-color: #222;
		color: white;
		padding: 10px 16px;
		border-radius: 8px;
		box-shadow: 0 0 10px rgba(0,0,0,0.3);
		font-weight: bold;
		z-index: 1000;">money lost to evil taxes: {fMoney($taxedMoney)}</div>

<Button
	static={true}
	onclick={() => {
		franchise.selectResearchLab();
	}}
>
	go to research lab
</Button>
<Button
	static={false}
	onclick={() => {
		franchise.deselectCountry();
	}}
>
	deselect country
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

<div class="countryrow">
	<div class="left block">
		<div class="block">
			<h1>Country</h1>
			<p style="font-size: 1.2rem;">Tax rate: {($taxRate ?? 1) * 100}%</p>
			<p style="font-size: 1.2rem;">Max influence tasks: {$maxInfluenceTasks}</p>
		</div>
		<div class = "block">
			{#if $country}
				<h2 style="font-size: 2rem">Influence</h2>
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
							width: {Math.min($influence / 1000 * 100, 100)}%;
							height: 100%;
							background-color: {$influence >= 500 ? 'green' : 'orange'};
							transition: width 0.3s;
						"
					></div>
				</div>
				<p>{$influence} / 1000</p>
				<div>Coffees sold per hour: {countryTotalCoffee}</div>
				<div>Beans produced per hour: {countryTotalBeans}</div>
			{/if}
		</div>
		<div class="erm">
			<h1>Possible tasks</h1>
		
			{#if influenceTasks}
				{#each $influenceTasks as task, i}
					<div class="upgrade-card">
						<p style="font-size: 1.2rem"><strong>{task.desc}</strong></p>
						<p>💰 Cost: {task.cost}</p>
						<p>📈 Influence Gain: +{task.influence}</p>
						<p>Time: {Math.floor(task.time)}</p>
						<Button onclick={() => franchise.startInfluenceTask(i)}>
							Start
						</Button>
					</div>
				{/each}
			{/if}
			<br>
			<br>
			<h1>Ongoing tasks</h1>
			{#if currinfluenceTasks}
				{#each $currinfluenceTasks as task, i}
					<div class="upgrade-card">
						<p style="font-size: 1.2rem"><strong>{task.desc}</strong></p>
						<p>💰 Cost: {Math.floor(task.cost)}</p>
						<p>📈 Influence Gain: +{task.influence}</p>
						<p>Time: {Math.floor(task.time)}</p>
						<Button onclick={() => franchise.stopInfluenceTask(i)}>
							Cancel
						</Button>
					</div>
				{/each}
			{/if}
		</div>
		
		{#if !$unlocked}
			<Button
					static={false}
					onclick={() => {
						franchise.unlockCountry();
					}}
				>
					Unlock country for: {franchise.currentCountry?.unlockCost} influence
			</Button>
		{/if}

	</div>
	
	<div class="right block">
		<div>
			{#if $regions}
				{#each $regions as region, i}
					<Region {region} {franchise} {unlocked} {i}></Region>
				{/each}
			{/if}
		</div>
	</div>
			
	<div class="rightright">
		<UpgradesPanel money = {influence} umKey =  {"franchise"} wshop = {franchise} ></UpgradesPanel>
			
	</div>

	<div class="importexport">
		<div style="font-size: 2rem;">Imports and Exports</div>
		{#each $regionList as region, i}
			<RegionImportExport region = {region} franchise = {franchise} i = {i}></RegionImportExport>
		{/each}
	</div>
</div>

<style>
	div.countryrow{
		display: flex;
		gap: 1rem;
		width: 100%;
	}

	div.left{
		width: 30vw;
		height: 45vw;
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
		overflow: auto;
		position: relative;
	}
	div.right {
		position: relative; 
		width: 40vw;
		height: 35vw;
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
	}
	div.rightright{
		position: relative; 
		width: 25vw;
		height: 40vw;
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
	div.importexport{
		position: relative; 
		width: 25vw;
		height: 40vw;
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
		overflow: auto;
	}
</style>
