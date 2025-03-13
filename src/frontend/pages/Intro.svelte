<script lang="ts">
	import { t } from "svelte-i18n";
	import { fade } from "svelte/transition";
	import { loadState, startNewGame } from "../../backend/game";
	import { pointerStyle } from "../components/Styles.svelte";
	import Button from "../components/Button.svelte";
  import { img } from "../../assets/img";

	let title = $state(true);
	let text = $state(-1);
	const script = ["intro1", "intro2", "intro3", "intro4"];
</script>

<svelte:window
	onmousedown={() => {
		if (!title && text >= 0) {
			text++;
			if (text >= script.length) {
				startNewGame();
			}
		}
	}}
/>

<main
	class="fl col {title ? 'title' : ''}"
	style={pointerStyle}
	transition:fade
>
	{#if title}
		<div transition:fade class="row" id="title-screen">
			<div id="title" class="col">
				<h1>{$t("gameTitle_1")}</h1>
				<h1>{$t("gameTitle_2")}</h1>
			</div>
			<div id="selections" class="col">
				<Button
					move={false}
					onclick={() => {
						title = false;
						setTimeout(() => {
							text++;
						}, 700);
					}}
				>
					<p>{$t("newGame_btn")}</p>
				</Button>
				{#if localStorage.getItem("GameSaveData") != null}
					<Button
						move={false}
						onclick={loadState}
					>
						<p>{$t("startGame_btn")}</p>
					</Button>
				{/if}
				<Button move={false}>
					<p>{$t("options_btn")}</p>
				</Button>
			</div>
		</div>
		<div id="bg">
			<img alt="background" src={img.titleScreen_planets_1} />
			<img alt="background" src={img.titleScreen_planets_2} />
			<img alt="background" src={img.titleScreen_planets_3} />
		</div>
	{:else if text >= 0}
		{#each script as key, i (key)}
			{#if text >= i}
				<h2 class="intro" transition:fade>{$t(key)}</h2>
			{/if}
		{/each}
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
	main:not(.title) {
		cursor: var(--cpointer), pointer;
	}

	.intro {
		text-align: center;
	}
</style>
