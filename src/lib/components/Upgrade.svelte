<script lang="ts">
	import { t } from "svelte-i18n";
	import { writable } from "svelte/store";
	import Button from "./Button.svelte";
	import { img } from "$lib/assets/img";
	import { fMoney } from "./Styles.svelte";
	import { fly } from "svelte/transition";

	let {
		item,
		key,
		purchased,
		cost = 0,
		level,
		flags = [],
		money = writable(0),
		onclick = () => {},
		onmouseenter = () => {},
		onmouseover = () => {},
		influence,
	} = $props();
</script>

<div class="col cont" in:fly={{ x: 500 , duration: 500 }} out:fly={{ x: 500, duration: 500 }}>
	<Button
		data-btn={purchased ? "" : "coin"}
		disabled={purchased || $money < cost ? true : false}
		{onclick}
		{onmouseenter}
		{onmouseover}
		class={`row upg ${purchased ? "purchased-upg" : ""} ${flags}`}
	>
		<img alt="upg" src={img[item.image]} />
		<h3>
			{$t(`${key}_upgName`)}{item.maxLevel != 1
				? ` LVL${level + (purchased ? 0 : 1)}`
				: ""}
		</h3>
		{#if influence == true}
			<p>{(cost)} influence</p>
		{:else}
			<p>{fMoney(cost)}</p>
		{/if}
		
	</Button>
</div>

<style>
	p {
		width: fit-content;
		margin-left: auto;
		text-align: right;
	}

	.cont {
		height: fit-content;
	}
</style>
