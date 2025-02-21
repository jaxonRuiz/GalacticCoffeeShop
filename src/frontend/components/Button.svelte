<script lang="ts">
	let {
		children,
		style = "",
		onclick = (() => {}),
		disabled = false,
		classes = [],
	} = $props();

	const pointer = `
	`;
</script>

<button
	style={`${pointer} ${style}`}
	{onclick}
	{disabled}
	class="button ${classes.join(' ')}"
>
	{@render children()}
</button>

<style>
	button {
		cursor: var(--cpointer), pointer;
	}
	button:disabled {
		cursor: var(--cno), not-allowed;
	}
</style>
