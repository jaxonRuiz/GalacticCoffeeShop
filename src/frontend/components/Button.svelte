<script lang="ts">
  import { pointerStyle } from "./Styles.svelte";

	let {
		children,
		"data-btn": dataBtn = "",
		style = "",
		onclick = (() => {}),
		disabled = false,
		classes = [],
	} = $props();

</script>

<button
	style={`${pointerStyle} ${style}`}
	data-btn={dataBtn}
	{onclick}
	{disabled}
	class="button ${classes.join(' ')}"
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
