<script lang="ts">
	import { t } from "svelte-i18n";
	import Button from "./Button.svelte";

	let { worker, sshop } = $props();

	let WA = sshop.w_workerAmounts;
</script>

<div class="row worker {worker}">
	<p>
		{$t(`${worker}_worker`)}: {`${$WA[worker + "Current"]} / ${$WA[worker + "Max"]}`}
	</p>
	<Button
		move={false}
		data-btn="plusOne"
		disabled={$WA[worker + "Current"] == $WA[worker + "Max"]}
		onclick={() => {
			sshop.addWorker(worker);
		}}>{$t("hireWorker_btn")}</Button
	>
	<Button
		move={false}
		data-btn="minusOne"
		disabled={$WA[worker + "Current"] == 0}
		onclick={() => {
			sshop.removeWorker(worker);
		}}>{$t("fireWorker_btn")}</Button
	>
</div>
