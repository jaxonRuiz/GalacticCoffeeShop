<script lang="ts">
	import { t } from "svelte-i18n";
	import Button from "./Button.svelte";
	import { fMoney } from "./Styles.svelte";

	let {
		item,
		key,
		purchased,
		cost,
		level,
		money,
		onclick = () => {},
	} = $props();
</script>

<Button
	data-btn={purchased ? "" : "coin"}
	disabled={purchased || $money < cost ? true : false}
	{onclick}
	classes={purchased ? ["purchased-upg"] : []}
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
