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
	let influenceTasks = $country?.w_influenceTaskList ?? writable([]);
	let currinfluenceTasks = $country?.w_currInfluenceTasks ?? writable([]);
	let influence = $country?.w_influence ?? writable(0);
	let maxInfluenceTasks = $country?.w_maxInfluenceTasks;
	let policyEvents = $country?.w_policyEvents ?? writable([]);
	let unlocked = $country?.w_unlocked;

</script>

<div class = "money">💰 ${$money}</div>

<Button
	static={true}
	onclick={() => {
		franchise.selectResearchLab();
	}}
>
	go to research lab
</Button>

<div class="country row">
	<div class="left block">
		<div class="block">
			<h1>Country</h1>
			<p style="font-size: 1.2rem;">Tax rate: {$taxRate}</p>
			<p style="font-size: 1.2rem;">Tariff rate: {$tariffRate}</p>
			<p style="font-size: 1.2rem;">Max influence tasks: {$maxInfluenceTasks}</p>
		</div>
		<div class = "block">
			{#if $country}
				<h2>Influence</h2>
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
			{/if}
		</div>
		<div class="block">
			<h1>Influence the government</h1>
		
			{#if influenceTasks}
				{#each $influenceTasks as task, i}
					<div class="upgrade-card">
						<p><strong>{task.desc}</strong></p>
						<p>💰 Cost: {task.cost}</p>
						<p>📈 Influence Gain: +{task.influence}</p>
						<p>Time: {task.time}</p>
						<Button onclick={() => franchise.startInfluenceTask(i)}>
							Start
						</Button>
					</div>
				{/each}
			{/if}
			{#if currinfluenceTasks}
				{#each $currinfluenceTasks as task, i}
					<div class="upgrade-card">
						<p><strong>{task.desc}</strong></p>
						<p>💰 Cost: {task.cost}</p>
						<p>📈 Influence Gain: +{task.influence}</p>
						<p>Time: {task.time}</p>
						<Button onclick={() => franchise.stopInfluenceTask(i)}>
							Cancel
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
			{#if !$unlocked}
			<Button
					static={false}
					onclick={() => {
						franchise.unlockCountry();
					}}
				>
					Unlock country for: {franchise.currentCountry?.unlockCost}
			</Button>
		{/if}
		</div>
	</div>
	
	<div class="center-column">
		<div class="right block">
			<div>
				{#if $regions}
					{#each $regions as region, i (region)}
						<Button
							onclick={() => { if (region.unlocked) franchise.selectRegion(region); }}
							style="
								position: absolute;
								left: {region.coordinates[0]/13}%;
								top: {region.coordinates[1]/11}%;
							"
						>
							region {i + 1}
						</Button>
			
						{#if !region.unlocked}
							<Button
								onclick={() => {
									if ($unlocked) {
										franchise.startRegionalVote(i);
										region.unlocked = region.unlocked;
									}
								}}
								disabled={!$unlocked}
								style="
									position: absolute;
									left: {region.coordinates[0] / 13}%;
									top: {region.coordinates[1] / 11 + 5}%;
									background-color: {!$unlocked ? '#aaa' : 'green'};
									color: white;
									cursor: {!$unlocked ? '--cno' : '--cpointer'};
								"
							>
								Start vote for: ${region.unlockCost}
							</Button>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
		
		
	</div>
	<div class="rightright">
		<h1>Events:</h1>
			{#if policyEvents}
				{#each $policyEvents as event, i}
					<div class="upgrade-card">
						<p><strong>{event.desc}</strong></p>
						<p>Time: {event.time}</p>
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
									width: {event.currentInfluence/event.totalInfluence * 100}%;
									height: 100%;
									background-color: #4caf50;
									transition: width 0.3s;
								"
							></div>
						</div>
						<Button onclick={() => franchise.voteAgainstPolicy(i)}>
							Vote against
						</Button>
						<Button onclick={() => franchise.voteForPolicy(i)}>
							Vote for
						</Button>
					</div>
				{/each}
			{/if}
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
		height: 50vw;
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
