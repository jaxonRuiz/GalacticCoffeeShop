<script lang="ts">
	import { t } from "svelte-i18n";
	import Button from "./Button.svelte";
	let { worker, sshop } = $props();

	let trig = $state(false);
	let WA = sshop.w_workerAmounts;
	let numWorkers = sshop.w_workerAmounts[worker + "Current"];
	let maxWorkers = sshop.w_workerAmounts[worker + "Max"];
</script>

<div class="row worker {worker}">
	{#key trig}
		<p>{$t(`${worker}_worker`)}: {`${$WA[worker + "Current"]} / ${$WA[worker + "Max"]}`}</p>
		<Button
			move={false}
			data-btn="plusOne"
			disabled={$WA[worker + "Current"] ==
				$WA[worker + "Max"]}
			onclick={() => {
				sshop.addWorker(worker);
				trig = !trig;
			}}>{$t("hireWorker_btn")}</Button
		>
		<Button
			move={false}
			data-btn="minusOne"
			disabled={$WA[worker + "Current"] == 0}
			onclick={() => {
				sshop.removeWorker(worker);
				trig = !trig;
			}}>{$t("fireWorker_btn")}</Button
		>
	{/key}
</div>
