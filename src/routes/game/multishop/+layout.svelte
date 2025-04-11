<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
	import type { MultiShop } from '$lib/backend/classes/multiShop';
  import { stageManager } from '$lib/backend/game';

	let { children } = $props();

	let smanager = stageManager
	let shopIndex = (smanager.currentScene as MultiShop).w_selectedShopIndex;
</script>

<div class="hidden">
	{#if $shopIndex >= 0}
		{goto(`${base}/game/multishop/shop`)}
	{:else}
		{goto(`${base}/game/multishop`)}
	{/if}
</div>

{@render children()}
