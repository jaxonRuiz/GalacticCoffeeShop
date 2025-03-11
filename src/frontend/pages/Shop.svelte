<script lang="ts">
	import { t } from "svelte-i18n";
	import { MultiShop } from "../../backend/classes/multiShop";
	import { stageManager } from "../../backend/game";
	import {
		upgradeJSON,
		UpgradeManager,
	} from "../../backend/systems/upgradeManager";
	import {
		fAppeal,
		fMoney,
		fSellableCoffee,
		pointerStyle,
	} from "../components/Styles.svelte";
	import Dropdown from "../components/Dropdown.svelte";
	import Upgrade from "../components/Upgrade.svelte";
	import Button from "../components/Button.svelte";
	import Tooltip from "../components/Tooltip.svelte";
	import Worker from "../components/Worker.svelte";
	import { derived } from "svelte/store";
  import { img } from "../../assets/img";

	// base
	const smanager = stageManager;
	const mockmshop: MultiShop = smanager.currentScene as MultiShop; //new MultiShop(timer.timeEvents, smanager);

	let { mshop = mockmshop, sshopInd = $bindable() } = $props();

	let sshop = mshop.shops[sshopInd];
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
	let promoterBool = sshop.w_promoterUnlocked;
	let supplierBool = sshop.w_supplierUnlocked;
	let multiShopUnlocked = sshop.w_multiShopUnlocked;
	let totalMoney = derived(
		[money, mshopMoney],
		([$money, $mshopMoney]) => $money + $mshopMoney
	);

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
	umanager.checkUpgrade(sshop).forEach((upgkey) => {
		upgs_cost[upgkey] = umanager.getCost(upgkey, sshop);
	});
	setInterval(() => {
		availableUpgrades = umanager.checkUpgrade(sshop);
	}, 1000);

	// for ui forced refreshes
	let refreshWorkers = $state(false);
	let refreshRestockPrice = $state(false);

	// for restock
	function updateRestock(key: string, count: number) {
		restockSheet.update((state) => {
			return {
				...state,
				[key]: state[key] + count,
			};
		});
		refreshRestockPrice = !refreshRestockPrice;
	}
</script>

<main class="shop container">
	{#if $multiShopUnlocked}
		<button
			class="yellow"
			onclick={() => {
				sshopInd = -1;
				sshop.deselectShop();
			}}
			id="return">{$t("toMultishop_btn")}</button
		>
	{/if}

	<div class="shop left col">
		<div class="col">
			<h1>{$t("localShop_title")} {sshopInd + 1}</h1>
			<p>{$t("lshopMoney_stat")}: {fMoney($money)}</p>
			<p>{$t("mshopMoney_stat")}: {fMoney($mshopMoney)}</p>
			<p>{$t("appeal_stat")}: {fAppeal($appeal)}</p>
			<p>{$t("sellableCoffee_stat")}: {fSellableCoffee($coffee)}</p>
		</div>
		<div id="main-art">
			<img alt="shop" src={img.coffeeShop_bot} />
			<img alt="rat" src={img.astrorat} class="float" />
			<img alt="shop" src={img.coffeeShop_top} />
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
				{#if true}
					<Worker worker="barista" {sshop} trig={refreshWorkers} />
				{/if}
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
				{#if $promoterBool}
					<Worker worker="promoter" {sshop} trig={refreshWorkers} />
				{/if}
				{#if true}
					<Worker worker="server" {sshop} trig={refreshWorkers} />
				{/if}
			</Dropdown>

			<Dropdown title={$t("restocking_title")}>
				<div class="tooltip">
					<Tooltip text={["restock_tooltip"]} />
				</div>
				{#key refreshRestockPrice}
					<p>{$t("restockPrice_stat")}: {fMoney(sshop.getRestockPrice())}</p>
				{/key}
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
								money={totalMoney}
								cost={upgs_cost[upgkey]}
								level={sshop.upgrades.get(upgkey) ?? 0}
								flags={upgs[upgkey].flags ?? []}
								onclick={() => {
									umanager.applyUpgrade(upgkey, sshop);
									upgs_cost[upgkey] = umanager.getCost(upgkey, sshop);
									availableUpgrades = umanager.checkUpgrade(sshop);
									rupg = !rupg;
									if (upgs[upgkey].flags?.includes("refreshWorkerUI")) {
										refreshWorkers = !refreshWorkers;
									}
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
							cost={upgs_cost[upgkey]}
							level={sshop.upgrades.get(upgkey) ?? 0}
						/>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</main>

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

<style>
	.restock {
		align-items: center;
		button {
			margin-left: 0;
			margin-right: 0;
			cursor: var(--cpointer), pointer;
		}
	}

	#return {
		position: absolute;
		top: 0;
		left: 0;
		cursor: var(--cpointer), pointer;
	}

	#main-art {
		img[alt="rat"] {
			top: 24%;
			right: 30%;
		}
	}
</style>
