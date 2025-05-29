<script lang="ts">
	import { fade } from "svelte/transition";
	import { t } from "svelte-i18n";
	import { page } from "$app/state";
	import { base } from "$app/paths";
	import TextDisplay from "$lib/components/TextDisplay.svelte";
	import { goto } from "$app/navigation";

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
		["Aka", "Icon Design"],
		["Zoe", "Icon Design"],
	];
</script>

{#if credits}
	<div class="cont" in:fade={{ delay: 1000 }} out:fade>
		<div class="col">
			<h1>{$t("thankYou_demo")}</h1>
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
	</div>
{:else}
	<div class="cont" out:fade>
		<TextDisplay
			script={["outro1", "outro2", "outro3"]}
			callback={() => {
				credits = true;
				setTimeout(() => {
					console.log(page.url.pathname);
					if (page.url.pathname == `${base}/game/ending`) {
						goto(`${base}/`);
					}
				}, 10000);
			}}
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
</style>
