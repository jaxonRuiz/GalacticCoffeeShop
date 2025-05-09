<script>
	import { fade } from 'svelte/transition';
	import { t } from "svelte-i18n";
  import { pointerStyle } from './Styles.svelte';

	let { script, callback } = $props();
	let progress = $state(0);

</script>

<svelte:window
	onmousedown={() => {
		progress++;
		if (progress == script.length) {
			callback();
		}
	}}
/>

<div class="col script fl" style={pointerStyle}>
	{#each script as key, i (key)}
		{#if progress >= i}
			<h2 class="intro" transition:fade>{$t(key)}</h2>
		{/if}
	{/each}
</div>

<style>
	.script {
		cursor: var(--cpointer), pointer;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		.intro {
			text-align: center;
		}
	}
</style>
