<script lang="ts">
	import { t } from "svelte-i18n";
	import { goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { fade } from "svelte/transition";
	import { loadState, startNewGame } from "$lib/backend/game";
	import { optionsWindowOpen } from "$lib/components/Options";
	import { pointerStyle } from "$lib/components/Styles.svelte";
	import { img } from "$lib/assets/img";
	import Button from "$lib/components/Button.svelte";
	import Options from "$lib/components/Options.svelte";

	let page = $state("title");
	let text = $state(-1);
	const script = ["intro1", "intro2", "intro3", "intro4"];
</script>

<svelte:window
	onmousedown={() => {
		if (page == "intro" && text >= 0) {
			text++;
			if (text == script.length) {
				startNewGame();
				goto(`${base}/game`);
			}
		}
	}}
/>

<main
	class="fl col {text >= 0 ? 'intro' : ''}"
	style={pointerStyle}
	transition:fade
>
	{#if text >= 0}
		<div id="intro" class="col">
			{#each script as key, i (key)}
				{#if text >= i}
					<h2 class="intro" transition:fade>{$t(key)}</h2>
				{/if}
			{/each}
		</div>
	{:else}
		<div transition:fade class="row" id="title-screen">
			<div id="title" class="col">
				<h1>{$t("gameTitle_1")}</h1>
				<h1>{$t("gameTitle_2")}</h1>
			</div>
			<div id="selections" class="col">
				<Button
					move={false}
					onclick={() => {
						page = "intro";
						text++;
					}}
				>
					<p>{$t("newGame_btn")}</p>
				</Button>
				{#if localStorage.getItem("GameSaveData") != null}
					<Button
						move={false}
						onclick={() => {
							loadState();
							goto(`${base}/game`);
						}}
					>
						<p>{$t("startGame_btn")}</p>
					</Button>
				{/if}
				<Button
					move={false}
					onclick={() => {
						$optionsWindowOpen = true;
					}}
				>
					<p>{$t("options_btn")}</p>
				</Button>
			</div>
		</div>
		<div transition:fade id="bg">
			<img alt="background" src={img.titleScreen_planets_1} />
			<img alt="background" src={img.titleScreen_planets_2} />
			<img alt="background" src={img.titleScreen_planets_3} />
		</div>
	{/if}
</main>

<style>
	.col,
	main {
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	main.intro {
		cursor: var(--cpointer), pointer;
	}

	#intro {
		position: fixed;
		width: 100%;
		height: 100%;
		.intro {
			text-align: center;
		}
	}
</style>
