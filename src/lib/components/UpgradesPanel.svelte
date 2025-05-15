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
	let descKey = $state(""); // upgrade key to display

	// upgrade checker on interval
	const fn = () => {
		return umanager.checkUpgrade(wshop).sort((upgkey) => {
			return umanager.getCost(upgkey, wshop) - $money;
		});
	};
	let availableUpgrades = $state(fn());
	const timerInterval = setInterval(() => {
		availableUpgrades = fn();
	}, 250);

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
	<div class="col scroll" id="upgrade-icon">
		{#key rupg}
			{#if upgPage == 0}
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
							availableUpgrades = umanager.checkUpgrade(wshop);
							rupg = !rupg;
						}}
						onmouseenter={() => {
							descKey = upgkey;
						}}
					/>
				{/each}
			{:else if upgPage === 1}
				{#each [...wshop.upgrades.keys()] as upgkey (upgkey)}
					<Upgrade
						purchased={true}
						item={upgs[upgkey]}
						key={upgkey}
						level={wshop.upgrades.get(upgkey) ?? 0}
						onmouseenter={() => {
							descKey = upgkey;
						}}
					/>
				{/each}
			{/if}
		{/key}
	</div>
	<div
		class="col {availableUpgrades.length > 0 ? '' : 'hidden'}"
		id="upgrade-desc"
	>
		{#key rupg}
			{#if descKey != ""}
				{@render upgradeDesc(descKey, upgPage === 1)}
			{:else}
				<h3>{$t("upgrade_tooltip")}</h3>
			{/if}
		{/key}
	</div>
</div>

{#snippet upgradeDesc(key: string, purchased: boolean)}
	<h3>
		{$t(`${key}_upgName`)}
	</h3>

	<p>{$t(`${key}_upgDesc`)}</p>
	{#if !purchased}
		<p>{$t("cost_stat")}: {fMoney(umanager.getCost(key, wshop))}</p>
	{/if}
{/snippet}

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

	#upgrade-icon {
		flex-grow: 1;
	}

	#upgrade-desc {
		height: 40%;
		padding: 2rem;
		h3 {
			margin-top: 0;
		}
	}
</style>
