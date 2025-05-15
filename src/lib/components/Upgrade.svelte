<script lang="ts">
	import { t } from "svelte-i18n";
  import { writable } from "svelte/store";
	import Button from "./Button.svelte";
  import { img } from "$lib/assets/img";

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
	<img alt="upg" src={img.upg_brew} />
	<h3>{$t(`${key}_upgName`)}</h3>
</Button>
