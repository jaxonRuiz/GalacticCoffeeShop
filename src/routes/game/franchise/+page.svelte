<script lang="ts">
	import { t } from "svelte-i18n";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import { stageManager } from "$lib/backend/game";
	import Button from "$lib/components/Button.svelte";
	import { fMoney } from "$lib/components/Styles.svelte";
	import { timer } from "$lib/backend/game";

	let hour = timer.w_hour;
	let day = timer.w_day;
	let franchise = stageManager.currentScene as Franchise;
	let countries = franchise.world.w_countries;
	let money = franchise.w_money;
	let launchProg = franchise.w_launchProgress;

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

<h2 style="font-size: 2rem">Launch Progress: {$launchProg}/1000</h2>

<div
	style="
		width: 50%;
		height: 24px;
		background-color: #ddd;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 4px;
	"
>
	<div
		style="
			width: {Math.min($launchProg / 1000 * 100, 100)}%;
			height: 100%;
			background-color: {$launchProg >= 500 ? 'green' : 'orange'};
			transition: width 0.3s;
		"
	></div>
</div>

{#if franchise.spaceFuelDiscovered}
	<p>space fuel discovered :D</p>
{:else}
	<p>space fuel not discovered D:</p>
{/if}

{#if franchise.spaceFuelDiscovered && $launchProg > 999}
	<Button
	static={true}
	onclick={() => {
		franchise.endFranchise();
	}}
>
	Blast off to space!
</Button>
{/if}

<div class="col block" style = "position: relative; height: 100vh;">
	<h1>World View</h1>
	{#each Object.keys($countries) as country (country)}
		<Button
			static={false}
			onclick={() => {
				franchise.world.selectCountry(country);
			}}
			style = "
				position: absolute;
				left: {($countries[country].coordinates[0] / 12)}%;
				top: {($countries[country].coordinates[1] / 11)}%;
			"
		>
			{country}
		</Button>
		<div
		style="
			position: absolute;
			left: {($countries[country].coordinates[0] / 12 + 0.8)}%;
			top: {($countries[country].coordinates[1] / 11 + 4)}%;
			width: 80px;
			height: 8px;
			background-color: #ccc;
			border-radius: 4px;
			overflow: hidden;
			z-index: 1;
		"
	>
		<div
			style="
				width: {Math.min($countries[country].influence / 1000 * 100, 100)}%;
				height: 100%;
				background-color: {$countries[country].influence >= 500 ? 'green' : 'orange'};
				transition: width 0.3s;
			"
		></div>
	</div>
	{/each}
</div>

<style>
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
