<script lang="ts">
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import { stageManager } from "$lib/backend/game";
	import Button from "$lib/components/Button.svelte";
	import ResearchTask from "$lib/components/franchise/ResearchTask.svelte";
	import ResearchUpgrade from "$lib/components/franchise/ResearchUpgrade.svelte";
	import { timer } from "$lib/backend/game";

	let hour = timer.w_hour;
	let day = timer.w_day;

	// base
	const smanager = stageManager;
	const franchise: Franchise = smanager.currentScene as Franchise;

	//variables
	let tasks = franchise.researchLab.w_currentTaskList;
	let upgrades = franchise.researchLab.w_UpgradeList;
	let res = franchise.w_researchers;
	let sciencePoints = franchise.w_sciencePoints;
</script>

<Button
	static={true}
	onclick={() => {
		franchise.deselectResearchLab();
	}}
>
	leave
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

<h1>Research Lab</h1>

<div class="lab-layout">
	<div class="left">
		<header style="font-size: 2rem;">Stats</header>
		<p>Science points: {$sciencePoints}</p>
		<p>Researchers: {$res}</p>
	</div>
	<div class="middle">
		<header style="font-size: 2rem;">Tasks</header>
		{#if tasks}
			{#each $tasks as task, i}
				<ResearchTask task = {task} franchise = {franchise} i = {i} ></ResearchTask>
			{/each}
		{/if}
	</div>
	<div class="right">
		<header style="font-size: 2rem;">Research</header>
		{#if upgrades}
			{#each $upgrades.slice(0, 5) as upgrade, i}
				<ResearchUpgrade upgrade = {upgrade} franchise = {franchise} sciencePoints = {sciencePoints} i = {i}></ResearchUpgrade>
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
	
</style>