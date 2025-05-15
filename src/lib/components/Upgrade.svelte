<script lang="ts">
	import { t } from "svelte-i18n";
  import { writable } from "svelte/store";
	import Button from "./Button.svelte";
  import { img } from "$lib/assets/img";
  import { fMoney } from "./Styles.svelte";

	let {
		item,
		key,
		purchased,
		cost = 0,
		level,
		flags = [],
		money = writable(0),
		onclick = (() => {}),
		onmouseenter = (() => {}),
		onmouseover = (() => {}),
	} = $props();
</script>

<Button
	data-btn={purchased ? "" : "coin"}
	disabled={purchased || $money < cost ? true : false}
	{onclick}
	{onmouseenter}
	{onmouseover}
	class={`row ${purchased ? "purchased-upg" : ""} ${flags}`}
>
	<img alt="upg" src={img[item.image]} />
	<h3>{$t(`${key}_upgName`)}{item.maxLevel != 1
			? ` LVL${level + (purchased ? 0 : 1)}`
			: ""}</h3>
	<p>{fMoney(cost)}</p>
</Button>

<style>
	p {
		width: fit-content;
		margin-left: auto;
		text-align: right;
	}
</style>
