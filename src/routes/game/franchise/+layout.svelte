<script lang="ts">
	import { goto } from "$app/navigation";
	import { base } from "$app/paths";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import { stageManager } from "$lib/backend/game";
	import Button from "$lib/components/Button.svelte";

	let { children } = $props();

	let smanager = stageManager;
	let stage = smanager.w_currentSceneIndex;
	let franchise = smanager.currentScene as Franchise;
	let country = franchise.w_currentCountry;
	let region = franchise.w_currentRegion;
	let researchLab = franchise.w_inResearchLab;
</script>

<div class="hidden">
	{#if $researchLab == true}
		{goto(`${base}/game/franchise/researchLab`)}
	{:else if $country != null && $region != null}
		{goto(`${base}/game/franchise/region`)}
	{:else if $country != null}
		{goto(`${base}/game/franchise/country`)}
	{:else if $stage == 3}
		{goto(`${base}/game/franchise`)}
	{/if}
</div>

<div class="franchise">
	{@render children()}
</div>
