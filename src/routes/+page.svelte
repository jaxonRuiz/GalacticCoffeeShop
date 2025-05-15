<script lang="ts">
	import { t } from "svelte-i18n";
	import { goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { fade } from "svelte/transition";
	import { loadState, startNewGame } from "$lib/backend/game";
	import { optionsWindowOpen } from "$lib/components/Options";
	import { img } from "$lib/assets/img";
	import Button from "$lib/components/Button.svelte";
	import { cleanupAudioManagers, AudioManager } from "$lib/backend/systems/audioManager";
	import { aud } from "$lib/assets/aud";
	import { onMount, onDestroy } from "svelte";
	import TextDisplay from "$lib/components/TextDisplay.svelte";

	let page = $state("title");
	let menuAudioManager: AudioManager;
	let menuMusicStarted = false;

	function startMenuMusic() {
		if (!menuMusicStarted && menuAudioManager) {
			menuAudioManager.playAudio("menu");
			menuAudioManager.setVolume("menu", 0);
			menuMusicStarted = true;
			menuAudioManager.fadeAudio("menu", 5000, 1);
		}
	}

	onMount(() => {
		cleanupAudioManagers(menuAudioManager);
		menuAudioManager = new AudioManager();
		menuAudioManager.addMusic("menu", aud.cafe_crumble);

		const handler = () => {
			startMenuMusic();
			window.removeEventListener("pointerdown", handler);
		};
		window.addEventListener("pointerdown", handler);
	});

	onDestroy(() => {
		if (menuAudioManager) {
			console.log("Destroying menu audio manager");
			menuAudioManager.fadeAudio("menu", 1000, 0, (c) => {
				menuAudioManager.stopAudio("menu");
				menuAudioManager.destroy();
			});
		}
	});
</script>

<main class="fl col" transition:fade>
	{#if page == "intro"}
		<div id="intro" class="col">
			<TextDisplay
				script={["intro1", "intro2", "intro3", "intro4"]}
				callback={() => {
					startNewGame();
					goto(`${base}/game`);
				}}
			/>
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

	#intro {
		position: fixed;
		width: 100%;
		height: 100%;
	}
</style>
