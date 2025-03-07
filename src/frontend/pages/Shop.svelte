<script lang="ts">
	import { t } from "svelte-i18n";
	import { MultiShop } from "../../backend/classes/multiShop";
	import { stageManager } from "../../backend/game";
	import {
		upgradeJSON,
		UpgradeManager,
	} from "../../backend/systems/upgradeManager";
	import { fMoney, pointerStyle } from "../components/Styles.svelte";
	import Dropdown from "../components/Dropdown.svelte";
	import Worker from "../components/Worker.svelte";
	import Upgrade from "../components/Upgrade.svelte";
  import Button from "../components/Button.svelte";
  import Tooltip from "../components/Tooltip.svelte";

	// base
	const smanager = stageManager;
	const mockmshop: MultiShop = smanager.currentScene as MultiShop; //new MultiShop(timer.timeEvents, smanager);

	let { wshop: mshop = mockmshop } = $props();

	let sshop = mshop.shops[0];
	let umanager = new UpgradeManager("localShop");

	// define variables
	let mshopMoney = mshop.w_money;
	let beans = sshop.w_beans;
	let appeal = sshop.w_appeal;
	let emptyCups = sshop.w_emptyCups;
	let coffee = sshop.w_coffeeCups;
	let customers = sshop.w_waitingCustomers;
	let money = sshop.w_money;
	let restockSheet = sshop.w_restockSheet;
	let coffeePrice = sshop.w_coffeePrice;

	// for upgrades
	let upgPage = $state(0);
	let rupg = $state(false);
	const upgs = upgradeJSON["localShop"];
	const upgs_cost = $state(
		Object.keys(upgs).reduce((costs: { [key: string]: number }, key) => {
			costs[key] = upgs[key].cost;
			return costs;
		}, {})
	);

	// upgrade checker on interval
	let availableUpgrades = $state(umanager.checkUpgrade(sshop));
	setInterval(() => {
		availableUpgrades = umanager.checkUpgrade(sshop);
	}, 1000);

	// for restock
	function updateRestock(key: string, count: number) {
		restockSheet.update((state) => {
			return {
				...state,
				[key]: state[key] + count,
			};
		});
	}
</script>

{#snippet restockItem(key: string)}
	<div class="row restock" style={pointerStyle}>
		<p>{$t(`${key}_text`)}</p>
		<!-- <input type="number" min="0" step="1" value={`${$restockSheet.beans}`} /> -->
		<button
			data-btn="minus"
			hidden={true}
			disabled={$restockSheet[key] >= 10 ? false : true}
			onclick={() => {
				updateRestock(key, -10);
			}}>-10</button
		>
		<button
			data-btn="minus"
			disabled={$restockSheet[key] >= 5 ? false : true}
			onclick={() => {
				updateRestock(key, -5);
			}}>-5</button
		>
		<button
			data-btn="minus"
			disabled={$restockSheet[key] >= 1 ? false : true}
			onclick={() => {
				updateRestock(key, -1);
			}}>-1</button
		>
		<p>{$restockSheet[key]}</p>
		<button
			data-btn="plus"
			onclick={() => {
				updateRestock(key, 1);
			}}>+1</button
		>
		<button
			data-btn="plus"
			onclick={() => {
				updateRestock(key, 5);
			}}>+5</button
		>
		<button
			data-btn="plus"
			hidden={true}
			onclick={() => {
				updateRestock(key, 10);
			}}>+10</button
		>
	</div>
{/snippet}

<main class="shop container">
	<div class="shop left col">
		<div class="col">
			<h1>Coffee Shop</h1>
			<p>{$t("lshopMoney_stat")}: ${$money.toFixed(2)}</p>
			<p>{$t("mshopMoney_stat")}: ${$mshopMoney.toFixed(2)}</p>
			<p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
			<p>{$t("sellableCoffee_stat")}: {Math.floor($coffee)}</p>
		</div>
	</div>

	<div class="shop right row">
		<div class="col scroll">
			<Dropdown title={$t("making_title")}>
				<div class="tooltip">
					<Tooltip text={["makeCoffee3_tooltip"]} />
				</div>
				<p>{$t("beans_stat")}: {$beans}</p>
				<p>{$t("emptyCups_stat")}: {$emptyCups}</p>
				<Button
					data-btn="plus"
					disabled={$beans > 0 && $emptyCups > 0 ? false : true}
					onclick={() => {
						sshop.produceCoffee();
					}}>{$t("makeCoffee_btn")}</Button
				>
				<Worker worker="barista" {sshop} />
			</Dropdown>

			<Dropdown title={$t("selling_title")}>
				<div class="tooltip">
					<Tooltip text={["promote_tooltip", "sellCoffee_tooltip"]} />
				</div>
				<p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
				<p>{$t("customersWaiting_stat")}: {$customers}</p>
				<Button
					data-btn="star"
					onclick={() => {
						sshop.promote();
					}}>{$t("promote_btn")}</Button
				>
				<Button
					data-btn="num"
					data-num={`${$coffeePrice.toFixed(2)}`}
					disabled={$customers > 0 && $coffee > 0 ? false : true}
					onclick={() => {
						sshop.sellCoffee();
					}}>{$t("sellCoffee_btn")}</Button
				>
				<Worker worker="server" {sshop} />
			</Dropdown>

			<Dropdown title={$t("restocking_title")}>
				<div class="tooltip">
					<Tooltip text={["restock_tooltip"]} />
				</div>
				<p>{$t("restockSheet_text")}</p>
				{#each Object.keys($restockSheet) as key}
					{@render restockItem(key)}
				{/each}
				<Button
					data-btn="coin"
					disabled={$restockSheet.beans * sshop.beansPrice +
						$restockSheet.emptyCups * sshop.cupsPrice >
					$mshopMoney + $money
						? true
						: false}
					onclick={() => {
						sshop.restock();
					}}>{$t("restock_btn")}</Button
				>
			</Dropdown>
		</div>
		<div class="col">
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
									level={sshop.upgrades.get(upgkey) ?? 0}
									onclick={() => {
										umanager.applyUpgrade(upgkey, sshop);
										upgs_cost[upgkey] = umanager.getCost(upgkey, sshop);
										availableUpgrades = umanager.checkUpgrade(sshop);
										rupg = !rupg;
									}}
								/>
							{/each}
						{/key}
					{:else if upgPage === 1}
						{#each [...sshop.upgrades.keys()] as upgkey (upgkey)}
							<Upgrade
								purchased={true}
								item={upgs[upgkey]}
								key={upgkey}
								{money}
								cost={upgs_cost[upgkey]}
								level={sshop.upgrades.get(upgkey) ?? 0}
							/>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	.restock {
		align-items: center;
		button {
			margin-left: 0;
			margin-right: 0;
			cursor: var(--cpointer), pointer;
		}
	}
</style>
