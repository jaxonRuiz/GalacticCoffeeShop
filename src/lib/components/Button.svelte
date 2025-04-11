<script lang="ts">
  import { fly } from "svelte/transition";
  import { pointerStyle } from "./Styles.svelte";

	let {
		children,
		"data-btn": dataBtn = "",
		"data-num": dataNum = "",
		style = "",
		onclick = (() => {}),
		disabled = false,
		classes = [],
		"class" : _class = "",
		static: move = false,
	} = $props();

</script>

<button
	transition:fly={move ? {} : { duration: 0 }}
	style={`${pointerStyle} ${style}`}
	data-btn={dataBtn}
	data-num={dataNum}
	{onclick}
	{disabled}
	class="button {classes.join(' ')} {_class}"
>
	{@render children()}
</button>

<style>
	button {
		cursor: var(--cpointer), pointer;
		&:disabled {
			cursor: var(--cno), not-allowed;
		}
	}
</style>
