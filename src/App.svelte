<script lang="ts">
	import Preshop from "./frontend/pages/Preshop.svelte";
	import Shop from "./frontend/pages/Shop.svelte";
	import Test from "./frontend/pages/Test.svelte";
	import Multishop from "./frontend/pages/Multishop.svelte";
  import Game from "./frontend/pages/Game.svelte";

	let tabs = ["game", "preshop", "shop", "multishop", "test"];
	let comps = [Game, Preshop, Shop, Multishop, Test];
	let currentTab = $state(0);
	let testing = $state(false); // open testing window

	function on_key_down(event: KeyboardEvent) {
		if (event.key === "t") {
			testing = !testing;
		}
	}
</script>

<svelte:window onkeydown={on_key_down} />

<main class="fl">
	<div id="test-window" style="display: {testing ? 'grid' : 'none'};">
		<div id="tabs" class="col">
			{#each tabs as tab, i}
				<label class="tab">
					<input
						type="radio"
						name="tab"
						value={i}
						bind:group={currentTab}
						onclick={() => {
							testing = false;
						}}
					/>
					<p>{tab}</p>
				</label>
			{/each}
		</div>
	</div>
	{#if currentTab > -1}
		{@const Comp = comps[currentTab]}
		<Comp />
	{/if}
</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
	}

	/* temporary stuffs */
	label:has(input:checked) {
		background-color: #242424;
	}

	#test-window {
		position: fixed;
		background-color: #00000088;
		z-index: 100;
		width: 100%;
		height: 100%;
		display: grid;
		#tabs {
			place-self: center;
			background-color: #000000;
			border: none;
			justify-content: space-around;
			input {
				display: none;
			}
			label {
				cursor: pointer;
				padding: 0.5em 4em;
			}
		}
	}
</style>
