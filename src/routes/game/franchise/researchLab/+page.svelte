<script lang="ts">
	import type { Franchise } from "$lib/backend/classes/franchise/franchise";
	import { stageManager } from "$lib/backend/game";
	import Button from "$lib/components/Button.svelte";

	// base
	const smanager = stageManager;
	const franchise: Franchise = smanager.currentScene as Franchise;
</script>

<h1>you are in research lab</h1>
<Button
	static={true}
	onclick={() => {
		franchise.deselectResearchLab();
	}}
>
	leave
</Button>
