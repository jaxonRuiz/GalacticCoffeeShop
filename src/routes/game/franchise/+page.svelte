<script lang="ts">
	import { t } from "svelte-i18n";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import { stageManager } from "$lib/backend/game";
	import Button from "$lib/components/Button.svelte";

	let franchise = stageManager.currentScene as Franchise;
	let countries = franchise.world.w_countries;
	let money = franchise.w_money;

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
