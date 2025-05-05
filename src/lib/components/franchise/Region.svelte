<script lang="ts">
	import Button from "../Button.svelte";
	import { fMoney } from "../Styles.svelte";

	let { region, franchise, unlocked, i } = $props();

	let rUnlocked = region.w_unlocked;
	let rVote = region.w_voteInProgress;
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
{#if !$rUnlocked && !$rVote}
	<Button
		onclick={() => {
			if ($unlocked) {
				franchise.startRegionalVote(i);
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
		Start vote for: {fMoney(region.unlockCost)}
	</Button>
{/if}
