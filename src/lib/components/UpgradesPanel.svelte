<script lang="ts">
	import { t } from "svelte-i18n";
	import { onDestroy } from "svelte";
	import { fMoney } from "./Styles.svelte";
	import {
		upgradeJSON,
		UpgradeManager,
	} from "../backend/systems/upgradeManager";
	import Upgrade from "./Upgrade.svelte";

	let upgPage = $state(0); // 0: unpurchased, 1: purchased
	let rupg = $state(false); // refresh upgrades flag

	let { money, umKey, wshop } = $props();

	let umanager = new UpgradeManager(umKey);
	const upgs = upgradeJSON[umKey];
	const upgs_cost = $state(
		Object.keys(upgs).reduce((costs: { [key: string]: number }, key) => {
			costs[key] = upgs[key].cost;
			return costs;
		}, {})
	);

	// upgrade checker on interval
	let availableUpgrades = $state(umanager.checkUpgrade(wshop));
	umanager.checkUpgrade(wshop).forEach((upgkey) => {
		upgs_cost[upgkey] = umanager.getCost(upgkey, wshop);
	});
	const timerInterval = setInterval(() => {
		availableUpgrades = umanager.checkUpgrade(wshop);
	}, 1000);

	onDestroy(() => {
		clearInterval(timerInterval);
	});
</script>

<div id="upgrades-panel" class="col block fixed">
	<h1>{$t("upgrades_title")}</h1>
	<p>{$t("money_stat")}: {fMoney($money)}</p>
	<div class="row">
		<label class="tab">
			<input
				checked
				type="radio"
				name="upgPage"
				value={0}
				bind:group={upgPage}
			/>
			<p>{$t("upgUnpurchased_btn")}</p>
		</label>
		<label class="tab">
			<input type="radio" name="upgPage" value={1} bind:group={upgPage} />
			<p>{$t("upgPurchased_btn")}</p>
		</label>
	</div>
	<div class="col scroll" id="upgrades">
		{#if upgPage == 0}
			{#key rupg}
				{#each availableUpgrades as upgkey (upgkey)}
					<Upgrade
						purchased={false}
						item={upgs[upgkey]}
						key={upgkey}
						{money}
						cost={umanager.getCost(upgkey, wshop)}
						level={wshop.upgrades.get(upgkey) ?? 0}
						flags={upgs[upgkey].flags ?? []}
						onclick={() => {
							umanager.applyUpgrade(upgkey, wshop);
							// upgs_cost[upgkey] = umanager.getCost(upgkey, wshop);
							availableUpgrades = umanager.checkUpgrade(wshop);
							rupg = !rupg;
						}}
					/>
				{/each}
			{/key}
		{:else if upgPage === 1}
			{#each [...wshop.upgrades.keys()] as upgkey (upgkey)}
				<Upgrade
					purchased={true}
					item={upgs[upgkey]}
					key={upgkey}
					cost={umanager.getCost(upgkey, wshop)}
					level={wshop.upgrades.get(upgkey) ?? 0}
				/>
			{/each}
		{/if}
	</div>
</div>

<style>
	#upgrades-panel {
		height: 100%;
	}

	.tab {
		cursor: var(--cpointer), pointer;
		padding-bottom: 0.7em;
		input {
			display: none;
		}
		p {
			padding: 0.5rem 1rem;
			margin: 0;
			border-radius: 0.5rem;
			border: transparent solid var(--borderW);
			box-sizing: border-box;
		}
		input:checked + p {
			border-color: white;
		}
	}

	div:has(> .tab) {
		justify-content: space-evenly;
	}

	#upgrades {
		flex-grow: 1;
	}
</style>
