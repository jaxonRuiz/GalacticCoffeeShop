<script lang="ts">
	import { img } from "../../assets/img";
	import { pointerStyle } from "./Styles.svelte";
  import { onDestroy, onMount } from "svelte";
  import { newToolTip, toggleTooltip, removeToolTip, tooltipStyle } from "./Tooltip";

	const { type = "right", text } = $props();

	let id: number = $state(-1);
	onMount(() => {
		if (!["top", "bot", "left", "right"].includes(type)) {
			throw new Error("Invalid type prop");
		}
		id = newToolTip(text, type as "top" | "bot" | "left" | "right");
	});
	onDestroy(() => {
		removeToolTip($state.snapshot(id));
	});
</script>

<div class="tooltip {type}" style={`${pointerStyle} ${tooltipStyle}`}>
	<button
		data-btn="tooltip"
	 	data-tooltipId={id}
		class="fl"
		onclick={() => {
			toggleTooltip(id);
		}}
	>
		<img alt="tooltip icon" src={img.tooltip} />
	</button>
</div>

<style>
	.tooltip {
		position: relative;
		width: var(--b);
		height: var(--b);
		display: flex;
		align-items: center;
		z-index: 50;
		img {
			width: 100%;
			height: 100%;
			/* opacity: 0.7; */
		}
	}
	button {
		width: var(--b);
		height: var(--b);
		padding: 0.2rem;
		background-color: transparent;
		flex-shrink: 0;
		&:hover {
			border: transparent solid 1px;
			background-color: transparent;
			cursor: var(--cpointer), pointer;
		}
	}
</style>
