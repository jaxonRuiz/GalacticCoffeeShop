<script lang="ts">
	import { t } from "svelte-i18n";
	import type { DevelopmentBase } from "$lib/backend/classes/franchise/developments/developmentbase";
	import Button from "./Button.svelte";

	let { dev } = $props();

	const d = dev as DevelopmentBase;
	let area = d.w_developmentArea;
	let buildings = d.w_availableBuildings;
</script>

<div class="development col block">
	<p>{d.developmentType}</p>
	<p>area available: {$area}</p>
	<br />
	{#each $buildings as building, i (building)}
		<div class="block">
			<p>{building.name}</p>
			<p>{building.desc}</p>
			<div class="row">
				<Button
					onclick={() => {
						d.buyBuilding(building);
					}}
				>
					buy
				</Button>
				<Button
					onclick={() => {
						d.sellBuilding(building);
					}}
				>
					sell
				</Button>
			</div>
		</div>
	{/each}
</div>

<style>
	.block {
		padding: 1rem;
		border: 1px solid var(--text);
	}
</style>
