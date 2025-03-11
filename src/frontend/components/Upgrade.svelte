<script lang="ts">
	import { t } from "svelte-i18n";
	import Button from "./Button.svelte";
	import { fMoney } from "./Styles.svelte";
  import { writable } from "svelte/store";

	let {
		item,
		key,
		purchased,
		cost,
		level,
		flags = [],
		money = writable(0),
		onclick = () => {},
	} = $props();
</script>

<Button
	data-btn={purchased ? "" : "coin"}
	disabled={purchased || $money < cost ? true : false}
	{onclick}
	class={purchased ? "purchased-upg" : ""}
	classes={flags}
>
	<h3>
		{$t(`${key}_upgName`)}{item.maxLevel != 1
			? ` LVL${level + (purchased ? 0 : 1)}`
			: ""}
	</h3>

	<p>{$t(`${key}_upgDesc`)}</p>
	{#if !purchased}
		<p>{$t("cost_stat")}: {fMoney(cost)}</p>
	{/if}
</Button>
