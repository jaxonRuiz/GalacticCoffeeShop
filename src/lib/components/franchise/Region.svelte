<script lang="ts">
	import Button from "../Button.svelte";
	import { fMoney } from "../Styles.svelte";
	import RegionBar from "./RegionBar.svelte";

	let { region, franchise, unlocked, i } = $props();

	let rUnlocked = region.w_unlocked;
	let rVote = region.w_voteInProgress;
	let population = region.w_population;
	let environment = region.climate;
</script>
<Button
	onclick={() => {
		if ($rUnlocked) franchise.selectRegion(region);
	}}
	style="
		position: absolute;
		left: {region.coordinates[0] / 13}%;
		top: {region.coordinates[1] / 11}%;
	"
>
	region {i + 1}
</Button>
<RegionBar 
	region = {region}
	style="
		position: absolute;
		left: {region.coordinates[0] / 13}%;
		top: {region.coordinates[1] / 11 - 3}%;
	"
></RegionBar>
<div style="
		position: absolute;
		left: {region.coordinates[0] / 13}%;
		top: {region.coordinates[1] / 11 - 5}%;
	">
	Population: {$population}
</div>
<div style="
		position: absolute;
		left: {region.coordinates[0] / 13}%;
		top: {region.coordinates[1] / 11 - 7}%;
	">
	Environment: {region.readClimate(environment)}
</div>
{#if !$rUnlocked && !$rVote}
	<Button
		onclick={() => {
			if ($unlocked) {
				franchise.buyRegion(i);
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
		Unlock region for {region.unlockCost} influence
	</Button>
	
{/if}
