<script lang="ts">
	let { x, y, type } = $props();

	const style = `
		position: absolute;
		top: ${y}px;
		left: ${x}px;
	`;
</script>

<div class="boop {type}" {style}>
</div>

<style>
	.default {
		width: 40px;
		height: 40px;
		background-color: red;
	}
	.button {
		width: 40px;
		height: 40px;
		background-color: greenyellow;
	}
</style>
