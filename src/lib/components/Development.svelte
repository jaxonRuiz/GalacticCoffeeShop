<script lang="ts">
	import { t } from "svelte-i18n";
	import type { DevelopmentBase } from "$lib/backend/classes/franchise/developments/developmentbase";
	import Button from "./Button.svelte";
	import { fMoney } from "./Styles.svelte.ts";

	let { dev } = $props();

	const d = dev as DevelopmentBase;
	let area = d.w_developmentArea;
	let availBuildings = d.w_availableBuildings;
	let boughtBuildings = d.w_boughtBuildings;
</script>

<div class="dev-container">
	<div class="block">
		<div class="dev-header row space-between">
			<div class="col">
				<p style="font-size: 1.3rem; font-weight: bold;">{d.developmentType}</p>
				<p>Area available: {$area} acres</p>
			</div>
			<div class="row button-group">
				<Button onclick={() => {d.decreaseDevelopmentArea()}}>
					Shrink
				</Button>
				<Button onclick={() => {d.increaseDevelopmentArea()}}>
					Expand
				</Button>
			</div>
		</div>

		<div class="buildings-container">
			<div class="bought-dev col inner-block">
				<h3>Bought Buildings</h3>
				{#each $boughtBuildings as building, i (building)}
					<div class="building-card">
						<p style="font-size: 1.2rem; font-weight: bold;">{building.name}</p>
						<p>{building.desc}</p>
						<p>Area Size: {building.areaSize} acres</p>
						<p>{building.whatDo()}</p>
						<p>Rent: {fMoney(building.rent)}/day</p>
						<div class="row">
							<Button
								onclick={() => {
									d.sellBuilding(building);
								}}
							>
								Sell for: {fMoney(building.sellCost)}
							</Button>
						</div>
					</div>
				{/each}
			</div>

			<div class="avail-dev col inner-block">
				<h3>Available Buildings</h3>
				{#each $availBuildings as building, i (building)}
					<div class="building-card">
						<p style="font-size: 1.rem; font-weight: bold;">{building.name}</p>
						<p>{building.desc}</p>
						<p>Area Size: {building.areaSize} acres</p>
						<p>{building.whatDo()}</p>
						<p>Rent: {fMoney(building.rent)}/day</p>
						<div class="row">
							<Button
								onclick={() => {
									d.buyBuilding(building);
								}}
							>
								Buy for: {fMoney(building.buyCost)}
							</Button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.dev-container {
		width: 100%;
		box-sizing: border-box;
		padding: 1rem;
	}

	.block {
		width: 100%;
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
	}

	.inner-block {
		border: 1px solid #555;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color:rgb(36, 36, 36);
		box-sizing: border-box;
	}

	.buildings-container {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
		margin-top: 1rem;
		width: 100%;
	}

	.bought-dev,
	.avail-dev {
		flex: 1;
	}

	.building-card {
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(43, 43, 43);
		box-sizing: border-box;
	}

	.dev-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

</style>
