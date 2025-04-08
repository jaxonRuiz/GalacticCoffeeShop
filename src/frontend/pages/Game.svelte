<script lang="ts">
	import { t } from "svelte-i18n";
	import { stageManager } from "../../backend/game";
	import Multishop from "./Multishop.svelte";
	import Preshop from "./Preshop.svelte";
	import Intro from "./Intro.svelte";
	import { Preshop as IPreshop } from "../../backend/classes/preshop";
	import { MultiShop as IMultishop } from "../../backend/classes/multiShop";
	import Options from "./Options.svelte";
	import Button from "../components/Button.svelte";

	const smanager = stageManager;

	const stage = smanager.w_currentSceneIndex;
	let options = $state(false);

	function on_key_down(event: KeyboardEvent) {
		if (event.key === "Escape" && $stage != 0) {
			options = !options;
		}
	}
</script>

<svelte:window onkeydown={on_key_down} />

{#if options}
	<div class="options">
		<div class="col">
			<Options />
			<br />
			<Button
				move={false}
				onclick={() => {
					options = false;
				}}
			>
				{$t("back_btn")}
			</Button>
		</div>
	</div>
{/if}

{#if $stage == 0}
	<Intro />
{:else if $stage == 1}
	<Preshop wshop={smanager.currentScene as IPreshop} />
{:else if $stage == 2}
	<Multishop wshop={smanager.currentScene as IMultishop} />
{/if}

<style>
	div.options {
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
	}
</style>
