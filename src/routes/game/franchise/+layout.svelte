<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import type { Franchise } from '$lib/backend/classes/franchise/franchise';
  import { stageManager } from '$lib/backend/game';

	let { children } = $props();

	let smanager = stageManager;
	let stage = smanager.w_currentSceneIndex;
	let country = (smanager.currentScene as Franchise).w_currentCountry;
	let region = (smanager.currentScene as Franchise).w_currentRegion;
</script>

<div class="hidden">
	{#if $country != null && $region != null}
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
