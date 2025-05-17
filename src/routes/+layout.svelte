<script lang="ts">
	import { fade } from "svelte/transition";
	import "@fontsource/syne-mono";
	import { page } from "$app/state";
	import { base } from "$app/paths";
	import { goto } from "$app/navigation";
	import { get } from "svelte/store";
	import { t } from "svelte-i18n";
	import type { MultiShop } from "$lib/backend/classes/multiShop";
	import {
		loadState,
		saveState,
		stageManager,
		pauseGame,
		resumeGame,
		endGame,
	} from "$lib/backend/game";
	import { booped, boops } from "$lib/components/Boops";
	import { pointerStyle } from "$lib/components/Styles.svelte";
	import { optionsWindowOpen } from "$lib/components/Options";
	import Boops from "$lib/components/Boops.svelte";
	import Button from "$lib/components/Button.svelte";
	import Options from "$lib/components/Options.svelte";
	import LoadingScreen from "$lib/components/LoadingScreen.svelte";
	import { loading, loadingScreen } from "$lib/components/LoadingScreen";
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import { addCoffee, addMoney } from "$lib/backend/analytics";

	const smanager = stageManager;
	let url = $derived(page.url.pathname);

	let { children } = $props();

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			$optionsWindowOpen = !get(optionsWindowOpen);
			if ($optionsWindowOpen) {
				pauseGame();
			} else {
				resumeGame();
			}
		}
	}

	function onMouseDown(event: MouseEvent) {
		let type = "default";
		const rat = (event.target as HTMLElement).closest("img");
		if (rat && rat.alt == "rat" && rat.dataset.clickable == "y") {
			console.log("rat");
			booped(rat.x - 0.1 * rat.width, rat.y + 0.4 * rat.height, "heart");
			return;
		}
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

<LoadingScreen />

<div id="overlays" class="fl" style={pointerStyle}>
	{#if $optionsWindowOpen}
		<div transition:fade={{ duration: 100 }} id="options">
			<div class="col">
				<Options />
				<br />
				<div class="row choices">
					{#if url !== `${base}/`}
						<Button
							move={false}
							onclick={() => {
								$optionsWindowOpen = false;
								saveState();
								// resumeGame();
								goto(`${base}/`);
							}}
						>
							{$t("returnToMenu_btn")}
						</Button>
					{/if}
					<Button
						move={false}
						onclick={() => {
							$optionsWindowOpen = false;
						}}
					>
						{$t("closeOptions_btn")}
					</Button>
				</div>
			</div>
		</div>
	{/if}

	<div id="test-window" style="display: none;">
		<div id="tabs" class="col"></div>
	</div>
	<div id="mouse-effects">
		{#each $boops as b (b.id)}
			<Boops x={b.x} y={b.y} type={b.type} numerical={b.num} />
		{/each}
	</div>
</div>

<div
	id="content"
	style={pointerStyle}
	class={$loading || $optionsWindowOpen ? "paused" : "playing"}
>
	{@render children()}
</div>

<style>
	#content,
	#overlays {
		width: 100%;
		height: 100%;
		cursor: var(--cdefault), default;
	}
	#overlays {
		pointer-events: none;
		position: absolute;
		z-index: 10000;
		width: 100vw;
		height: 100vh;
		display: grid;
		place-content: center;
	}

	#mouse-effects {
		position: fixed;
		z-index: 1000;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	#options {
		pointer-events: auto;
		overflow: hidden;
		position: fixed;
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		background-color: color-mix(in srgb, var(--bg1) 85%, transparent 15%);
		z-index: 1000;
		> div {
			background-color: var(--bg2);
			border-radius: 1rem;
			padding: 3rem;

			br {
				margin: 1rem;
			}
		}
		.choices {
			justify-content: space-around;
		}
	}
</style>
