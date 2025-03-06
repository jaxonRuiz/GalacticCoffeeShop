<script lang="ts">
	import { t } from "svelte-i18n";
	import Button from "./Button.svelte";
	let { worker, sshop } = $props();

	let trig = $state(false);
</script>

<div class="row worker {worker}">
	{#key trig}
		<p>{$t(`${worker}_worker`)}: {sshop.roles.get(worker).numWorkers}</p>
		<Button
			move={false}
			data-btn="plusOne"
			disabled={sshop.roles.get(worker).maxWorkers ==
				sshop.roles.get(worker).numWorkers}
			onclick={() => {
				sshop.addWorker(worker);
				trig = !trig;
			}}>{$t("hireWorker_btn")}</Button
		>
		<Button
			move={false}
			data-btn="minusOne"
			disabled={sshop.roles.get(worker).numWorkers == 0}
			onclick={() => {
				sshop.removeWorker(worker);
				trig = !trig;
			}}>{$t("fireWorker_btn")}</Button
		>
	{/key}
</div>
