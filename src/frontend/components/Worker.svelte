<script lang="ts">
	import { t } from "svelte-i18n";
	let { worker, sshop } = $props();

	let trig = $state(false);
</script>

<div class="row worker {worker}">
	{#key trig}
		<p>{$t(`${worker}_worker`)}: {sshop.roles.get(worker).numWorkers}</p>
	{/key}
	<button
		onclick={() => {
			sshop.addWorker(worker);
			trig = !trig;
		}}>{$t("hireWorker_btn")}</button
	>
	<button
		onclick={() => {
			sshop.removeWorker(worker);
			trig = !trig;
		}}>{$t("fireWorker_btn")}</button
	>
</div>
