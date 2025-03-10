<script lang="ts">
	import { t } from "svelte-i18n";
	import { MultiShop } from "../../backend/classes/multiShop";
	import {
		upgradeJSON,
		UpgradeManager,
	} from "../../backend/systems/upgradeManager";
	import { stageManager } from "../../backend/game";
	import Shop from "./Shop.svelte";
	import Upgrade from "../components/Upgrade.svelte";
	import { fMoney } from "../components/Styles.svelte";

	const mockmshop = stageManager.currentScene as MultiShop;
	let umanager = new UpgradeManager("multiShop");

	let { wshop: mshop = mockmshop } = $props();

	// upgrades
	let upgPage = $state(0);
	let rupg = $state(false);
	const upgs = upgradeJSON["multiShop"];
	const upgs_cost = $state(
		Object.keys(upgs).reduce((costs: { [key: string]: number }, key) => {
			costs[key] = upgs[key].cost;
			return costs;
		}, {})
	);

	// upgrade checker on interval
	let availableUpgrades = $state(umanager.checkUpgrade(mshop));
	setInterval(() => {
		availableUpgrades = umanager.checkUpgrade(mshop);
	}, 1000);

	// using shops
	let sshopInd = $state(0);

	// define variables
	let money = mshop.w_money;
	let shops = mshop.w_shops;
</script>

{#if sshopInd < 0}
	<main class="row shop">
		<div class="col left">
			<div class="row top">
				<div class="col stats">
					<h1>multishop</h1>
					<p>{$t("money_stat")}: {fMoney($money)}</p>
					<button>{$t("extractMoney_btn")}</button>
				</div>
				<div>imagine graphics here</div>
			</div>

			<div class="row shop-cards scroll">
				{#each $shops as _shop, ind (ind)}
					{@render card(ind)}
				{/each}
			</div>
		</div>

		<div class="col right">
			<div class="col block fixed">
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
									cost={upgs_cost[upgkey]}
									level={mshop.upgrades.get(upgkey) ?? 0}
									onclick={() => {
										umanager.applyUpgrade(upgkey, mshop);
										upgs_cost[upgkey] = umanager.getCost(upgkey, mshop);
										availableUpgrades = umanager.checkUpgrade(mshop);
										rupg = !rupg;
									}}
								/>
							{/each}
						{/key}
					{:else if upgPage === 1}
						{#each [...mshop.upgrades.keys()] as upgkey (upgkey)}
							<Upgrade
								purchased={true}
								item={upgs[upgkey]}
								key={upgkey}
								{money}
								cost={upgs_cost[upgkey]}
								level={mshop.upgrades.get(upgkey) ?? 0}
							/>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</main>
{:else}
	<Shop {mshop} bind:sshopInd />
{/if}

{#snippet card(ind: number)}
	<button
		class="card col"
		onclick={() => {
			sshopInd = ind;
		}}
	>
		<h1>shop name</h1>
		<p>amount of money</p>
	</button>
{/snippet}

<style>
	.shop {
		height: 100%;
		width: 100%;

		.left {
			width: 70%;
			background-color: var(--bg1);
		}
		.right {
			flex-grow: 1;
		}
	}

	.shop .left {
		.top {
			flex-grow: 1;

			.stats {
				width: 40%;
			}

			& > div:not(.stats) {
				width: 60%;
			}
		}
	}

	.shop-cards {
		flex-wrap: nowrap;
		height: 40%;
		.card {
			margin: 0.5rem;
			flex-shrink: 0;
			justify-content: space-evenly;
			box-sizing: border-box;
		}
	}
</style>
