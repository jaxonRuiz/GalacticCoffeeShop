<script lang="ts">
	import { fade } from "svelte/transition";
	import { t } from "svelte-i18n";
	import { page } from "$app/state";
	import { base } from "$app/paths";
	import TextDisplay from "$lib/components/TextDisplay.svelte";
	import { goto } from "$app/navigation";
	import { img } from "$lib/assets/img";

	let gameCreditsCont: HTMLElement | undefined = $state();
	let gameCredits: HTMLElement | undefined = $state(); // actual content
	let credits = $state(false);

	const rbs: string[][] = [
		["Lyssa Li", "Producer & Interface Lead"],
		["Jaxon Ruiz", "Backend & Systems Lead"],
		["Lily Chen", "Art & Design"],
		["Aidan Higgins", "Backend & System Design"],
		["Marco Ogaz-Vega", "Backend & Lead Audio Programmer"],
	];
	const collab: string[][] = [
		["Tien", "Art & Trailer"],
		["Cole Falxa", "Audio Programming"],
		["Garrett Blake", "QA"],
		["Jonah", "QA"],
		["Connor Lowe", "QA"],
		["Patrick", "QA"],
		["Moore", "QA"],
		["Akash Basu", `"Mascot"`],
		["Zoe", "Asset Drafting"],
	];

	function rollCredits() {
		credits = true;

		const i = setInterval(() => {
			// game credits may not be defined at speed :(
			if (gameCredits) {
				clearInterval(i);

				const pain = new IntersectionObserver(startObservation, {
					threshold: [0, 1],
				});
				pain.observe(gameCredits);
			}
		}, 16);

		const i2 = setInterval(() => {
			if (gameCreditsCont) {
				gameCreditsCont.scrollTop += 1;
			}
		}, 16);

		function startObservation(entries: any) {
			entries.forEach((entry: any) => {
				if (entry.intersectionRatio === 0) {
					clearInterval(i2);

					if (page.url.pathname == `${base}/game/ending`) {
						goto(`${base}/`);
					}
				}
			});
		}
	}
</script>

{#if credits}
	<div
		bind:this={gameCreditsCont}
		class="cont game-credits disable-scrollbar"
		in:fade={{ delay: 1000 }}
		out:fade
	>
		<div class="spacer top"></div>
		<div bind:this={gameCredits} class="col">
			<h1>{$t("thankYou_demo")}</h1>
			<br />
			<br />
			<img src={img.rbs} alt="studio icon" />
			<br />
			<h2>{$t("developed_by")}</h2>
			<div>
				{#each rbs as person (person[0])}
					{@render credit(person[0], person[1])}
				{/each}
			</div>
			<br />
			<br />
			<h2>{$t("external_collaborators")}</h2>
			<div>
				{#each collab as person (person[0])}
					{@render credit(person[0], person[1])}
				{/each}
			</div>
		</div>
		<div class="spacer"></div>
	</div>
{:else}
	<div class="cont" transition:fade>
		<TextDisplay
			script={["outro1", "outro2", "outro3"]}
			callback={rollCredits}
		/>
	</div>
{/if}

{#snippet credit(person: string, role: string)}
	<div class="row credit">
		<p>{person}</p>
		<p>{role}</p>
	</div>
{/snippet}

<style>
	div.game-credits {
		overflow-y: auto;
		user-select: none;
		pointer-events: none;
	}
	div.cont {
		position: fixed;
		width: 100%;
		height: 100%;
	}

	.col {
		width: 60%;
		min-width: 700px;
		height: fit-content;
		margin: auto;
		align-items: center;
	}

	h1,
	h2,
	p {
		text-align: center;
	}

	br {
		margin: 2rem;
	}

	div:has(> .credit) {
		width: 50%;
		max-width: 600px;
		min-width: 400px;

		.credit {
			justify-content: space-between;
		}
	}

	img[alt="studio icon"] {
		width: 350px;
	}

	div.spacer {
		height: 100%;
		&.top {
			height: 70%;
		}
	}
</style>
