<script lang="ts">
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import { stageManager } from "$lib/backend/game";
	import Button from "$lib/components/Button.svelte";

	// base
	const smanager = stageManager;
	const franchise: Franchise = smanager.currentScene as Franchise;

	//variables
	let tasks = franchise.researchLab.w_currentTaskList;
	let upgrades = franchise.researchLab.w_UpgradeList;
	let res = franchise.w_researchers;
	let sciencePoints = franchise.w_sciencePoints;
</script>

<h1>Research Lab</h1>

<div class="lab-layout">
	<div class="left">
		<header style="font-size: 2rem;">Stats</header>
		<p>Science points: {$sciencePoints}</p>
		<p>Researchers: {$res}</p>
		<Button
			static={true}
			onclick={() => {
				franchise.deselectResearchLab();
			}}
		>
			leave
		</Button>
	</div>
	<div class="middle">
		<header style="font-size: 2rem;">Tasks</header>
		{#if tasks}
			{#each $tasks as task, i}
				<div class="upgrade-card">
					<p>{task.desc}</p>
					<p>Estimated time left: {Math.floor(task.researchUnits / (task.researchersAllocated * franchise.researchLab.researcherSpeed * 4))}</p>
					<p>Researchers working: {task.researchersAllocated}</p>
					<p>Reward: {task.sciencePoints}</p>
					<Button onclick={() => franchise.researchLab.allocateResearchers(1, i)}
						disabled={$res < 1}
						style = "
							background-color: {$res < 1 ? '#444' : '#515151'};
							cursor: {$res < 1 ? '--cno' : '--cpointer'};
						">
						Allocate 1 researcher
					</Button>
					<Button onclick={() => franchise.researchLab.allocateResearchers(10, i)}
						disabled={$res < 1}
						style = "
							background-color: {$res < 1 ? '#444' : '#515151'};
							cursor: {$res < 1 ? '--cno' : '--cpointer'};
						">
						Allocate 10 researcher
					</Button>
				</div>
			{/each}
		{/if}
	</div>
	<div class="right">
		<header style="font-size: 2rem;">Research</header>
		{#if upgrades}
			{#each $upgrades as upgrade, i}
				<div class="upgrade-card">
					<p>{upgrade.name}</p>
					<p>{upgrade.desc}</p>
					<p>Costs: {upgrade.cost}</p>
					<Button 
					onclick={() => franchise.buyUpgrade(i)}
					disabled={$sciencePoints < upgrade.cost}
					style = "
						background-color: {$sciencePoints < upgrade.cost ? '#444' : '#515151'};
						cursor: {$sciencePoints < upgrade.cost ? '--cno' : '--cpointer'};
					">
						Unlock
					</Button>
				</div>
			{/each}
		{/if}
	</div>
</div>


<style>
	.lab-layout {
		display: flex;
		gap: 1rem;
	}
	div.left{
		width: 50vh;
		height: 90vh;
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(28, 28, 28);
		box-sizing: border-box;
	}
	div.middle{
		width: 50vh;
		height: 90vh;
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(28, 28, 28);
		box-sizing: border-box;
	}
	div.right{
		width: 50vh;
		height: 90vh;
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(28, 28, 28);
		box-sizing: border-box;
	}
	div.upgrade-card{
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(28, 28, 28);
		box-sizing: border-box;
	}
</style>