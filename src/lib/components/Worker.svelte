<script lang="ts">
	import { t } from "svelte-i18n";

	let { worker, sshop } = $props();

	let WA = sshop.w_workerAmounts;
</script>

<div class="row worker {worker}">
	<p>
		{$t(`${worker}_worker`)}: {`${$WA[worker + "Current"]}`}
	</p>
</div>
