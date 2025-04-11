<script lang="ts">
	import { t } from "svelte-i18n";
	import { MultiShop } from "../../backend/classes/multiShop";
	import { stageManager } from "../../backend/game";
	import {
		fAppeal,
		fMoney,
		fSellableCoffee,
		pointerStyle,
	} from "../../../src/lib/components/Styles.svelte";
	import Dropdown from "../../../src/lib/components/Dropdown.svelte";
	import Button from "../../../src/lib/components/Button.svelte";
	import Tooltip from "../../../src/lib/components/Tooltip.svelte";
	import Worker from "../../../src/lib/components/Worker.svelte";
	import { derived } from "svelte/store";
	import { img } from "../../assets/img";
	import UpgradesPanel from "../../../src/lib/components/UpgradesPanel.svelte";

	// base
	const smanager = stageManager;
	const mockmshop: MultiShop = smanager.currentScene as MultiShop; //new MultiShop(timer.timeEvents, smanager);

	let { mshop = mockmshop, sshopInd = $bindable() } = $props();

	let sshop = mshop.shops[sshopInd];

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
			<h3>{$t("lshopMoney_stat")}: {fMoney($money)}</h3>
			<h3>{$t("mshopMoney_stat")}: {fMoney($mshopMoney)}</h3>
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
					<Tooltip text={["makeCoffee3_tooltip", "hire_tooltip"]} />
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
					<Worker worker="barista" {sshop} />
				{/if}
			</Dropdown>

			<Dropdown title={$t("selling_title")}>
				<div class="tooltip">
					<Tooltip
						text={["promote_tooltip", "sellCoffee_tooltip", "hire_tooltip"]}
					/>
				</div>
				<p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
				<p>{$t("customersWaiting_stat")}: {$customers}</p>
				<p>{$t("sellableCoffee_stat")}: {fSellableCoffee($coffee)}</p>
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
					<Worker worker="promoter" {sshop} />
				{/if}
				{#if true}
					<Worker worker="server" {sshop} />
				{/if}
			</Dropdown>

			<Dropdown title={$t("restocking_title")}>
				<div class="tooltip">
					<Tooltip text={["restock_tooltip"]} />
				</div>
					<p>{$t("restockPrice_stat")}: {fMoney(sshop.getRestockPrice())}</p>
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
				{#if ($coffee < 1 && (($money < sshop.cupsPrice && $emptyCups < 1) || ($money < sshop.beansPrice && $beans < 1))) || ($money < sshop.beansPrice + sshop.cupsPrice && $coffee < 3 && $beans < 3 && $emptyCups < 3)}
					<Button
						data-btn="plus"
						onclick={() => {
							sshop.choresForBeans();
						}}>{$t("choresForBeans_btn")}</Button
					>
				{/if}
			</Dropdown>
		</div>
		<div class="col">
			<UpgradesPanel
				wshop={sshop}
				umKey="localShop"
				money={totalMoney}
			/>
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
