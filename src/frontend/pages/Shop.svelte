<script lang="ts">
	import { MultiShop } from "../../backend/classes/multiShop";
	import { Shop } from "../../backend/classes/shop";
	import { StageManager } from "../../backend/systems/stageManager";
	import { Timer } from "../../backend/systems/time";
	import { UpgradeManager } from "../../backend/systems/upgradeManager";
	import Dropdown from "../components/Dropdown.svelte";
	import { t } from "svelte-i18n";
	import Worker from "../components/Worker.svelte";

	// base
	let timer = new Timer();
	const smanager = new StageManager(timer);
	const mockmshop = new MultiShop(timer.timeEvents, smanager);

	let { wshop: mshop = mockmshop } = $props();

	let sshop = mshop.shops[0];
	let umanager = new UpgradeManager("shop"); //TODO

	// define variables
	let mshopMoney = mshop.w_money;
	let beans = sshop.w_beans;
	let appeal = sshop.w_appeal;
	let emptyCups = sshop.w_emptyCups;
	let coffee = sshop.w_coffeeCups;
	let customers = sshop.w_waitingCustomers;
	let money = sshop.w_money;
	let cleanness = sshop.w_cleanness;
	let restockSheet = sshop.w_restockSheet;

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
	<div class="row restock">
		<p>{$t(`${key}_text`)}</p>
		<!-- <input type="number" min="0" step="1" value={`${$restockSheet.beans}`} /> -->
		<button
			hidden={true}
			disabled={$restockSheet[key] >= 10 ? false : true}
			onclick={() => {
				updateRestock(key, -10);
			}}>-10</button
		>
		<button
			disabled={$restockSheet[key] >= 5 ? false : true}
			onclick={() => {
				updateRestock(key, -5);
			}}>-5</button
		>
		<button
			disabled={$restockSheet[key] >= 1 ? false : true}
			onclick={() => {
				updateRestock(key, -1);
			}}>-1</button
		>
		<p>{$restockSheet[key]}</p>
		<button
			onclick={() => {
				updateRestock(key, 1);
			}}>+1</button
		>
		<button
			onclick={() => {
				updateRestock(key, 5);
			}}>+5</button
		>
		<button
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
			<p>{$t("money_stat")}: ${$money.toFixed(2)}</p>
			<p>{$t("mshopMoney_stat")}: ${$mshopMoney.toFixed(2)}</p>
			<p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
			<p>{$t("sellableCoffee_stat")}: {Math.floor($coffee)}</p>
		</div>
	</div>

	<div class="shop right row">
		<div class="col">
			<Dropdown title={$t("making_title")}>
				<p>{$t("beans_stat")}: {$beans}</p>
				<p>{$t("emptyCups_stat")}: {$emptyCups}</p>
				<button
					disabled={$beans > 0 && $emptyCups > 0 ? false : true}
					onclick={() => {
						sshop.produceCoffee();
					}}>{$t("makeCoffee_btn")}</button
				>
				<Worker worker="barista" {sshop} />
			</Dropdown>

			<Dropdown title={$t("selling_title")}>
				<p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
				<p>{$t("customersWaiting_stat")}: {$customers}</p>
				<button
					onclick={() => {
						sshop.promote();
					}}>{$t("promote_btn")}</button
				>
				<button
					disabled={$customers > 0 && $coffee > 0 ? false : true}
					onclick={() => {
						sshop.sellCoffee();
					}}>{$t("sellCoffee_btn")}</button
				>
				<Worker worker="server" {sshop} />
			</Dropdown>

			<Dropdown title={$t("cleaning_title")}>
				<p>{$t("cleanness_stat")}: {$cleanness}</p>
				<button>{$t("clean_btn")}</button>
			</Dropdown>

			<Dropdown title={$t("restocking_title")}>
				<p>{$t("restockSheet_text")}</p>
				{#each Object.keys($restockSheet) as key}
					{@render restockItem(key)}
				{/each}
				<button
					disabled={$restockSheet.beans * sshop.beansPrice +
						$restockSheet.emptyCups * sshop.cupsPrice >
					$mshopMoney + $money
						? true
						: false}
					onclick={() => {
						sshop.restock();
					}}>{$t("restock_btn")}</button
				>
			</Dropdown>
		</div>
		<div class="col">
			<div class="col block">
				<h1>{$t("upgrades_title")}</h1>
			</div>
		</div>
	</div>
</main>

<style>
	.shop.right > div {
		width: 50%;
		overflow-y: scroll;
	}

	.restock {
		align-items: center;
		button {
			margin-left: 0;
			margin-right: 0;
		}
	}
</style>
