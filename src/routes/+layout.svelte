<script lang="ts">
	import "@fontsource/syne-mono";
	import type { MultiShop } from "$lib/backend/classes/multiShop";
	import { loadState, saveState, stageManager } from "$lib/backend/game";
	import { booped } from "$lib/components/Boops";
	import { pointerStyle } from "$lib/components/Styles.svelte";

	const smanager = stageManager;
	let testing = $state(false); // open testing window

	let { children } = $props();

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "t") {
			testing = !testing;
		}
		if (event.key === "p") {
			console.log("app loading");
			loadState();
		}
		if (event.key === "o") {
			console.log("app saving");
			saveState();
		}
		// if (event.key === "r") {
		//   resetState();
		//   smanager.currentSceneIndex = 0;
		//   currentTab = 0;
		// }
		if (event.key === "4") {
			// dev key to add money, only works in valid scenes
			try {
				(smanager.currentScene as MultiShop).money += 1000;
			} catch (e) {
				console.log(e);
			}
		}
	}

	function onMouseDown(event: MouseEvent) {
		let type = "default";
		const b = (event.target as HTMLElement).closest("button");
		if (b) {
			type = b.dataset.btn ?? "button";
			if (type === "num") {
				booped(event.clientX, event.clientY, type, b.dataset.num!);
				return;
			}
		}
		booped(event.clientX, event.clientY, type);
	}
</script>

<svelte:window onkeydown={onKeyDown} onmousedown={onMouseDown} />

<div id="content" style={pointerStyle}>
	{@render children()}
</div>

<style>
	#content {
		width: 100%;
		height: 100%;
		&:hover {
			cursor: var(--cdefault), default;
		}
	}
</style>
