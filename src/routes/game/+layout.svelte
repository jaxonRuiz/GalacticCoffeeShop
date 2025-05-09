<script lang="ts">
	import { goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { gameOver, stageManager } from "$lib/backend/game";

	let { children } = $props();

	const smanager = stageManager;
	const stage = smanager.w_currentSceneIndex;
	const fin = gameOver;
</script>

<div class="hidden">
	{#if $fin}
		{goto(`${base}/game/ending`)}
	{:else if $stage == 0}
		{goto(`${base}/`)}
	{:else if $stage == 1}
		{goto(`${base}/game/preshop`)}
	{:else if $stage == 2}
		{goto(`${base}/game/multishop`)}
	{:else if $stage == 3}
		{goto(`${base}/test`)}
	{/if}
</div>

{@render children()}

<style>
</style>
