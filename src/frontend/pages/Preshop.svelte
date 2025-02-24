<script lang="ts">
	import { t } from "svelte-i18n";
	import { upgradeJSON } from "../../backend/systems/upgradeManager";
	import { Preshop } from "../../backend/classes/preshop";
	import { Timer } from "../../backend/systems/time";
	import { UpgradeManager } from "../../backend/systems/upgradeManager";
	import { StageManager } from "../../backend/systems/stageManager";
	import Dropdown from "../components/Dropdown.svelte";
	import Button from "../components/Button.svelte";
	import { pointerStyle } from "../components/Styles.svelte";

	// base
	let timer = new Timer();
	let smanager = new StageManager(timer);
	const mockpshop = new Preshop(timer.timeEvents, smanager);

	let { wshop: pshop = mockpshop } = $props();

	let umanager = new UpgradeManager("preshop");

	// for upgrades
	let rupgs = $state(false);
	const upgs = upgradeJSON["preshop"];
	const upgs_cost = $state(
		Object.keys(upgs).reduce((costs: { [key: string]: number }, key) => {
			costs[key] = upgs[key].cost;
			return costs;
		}, {})
	);

	// upgrade checker on interval
	let availableUpgrades = $state(umanager.checkUpgrade(pshop));
	setInterval(() => {
		availableUpgrades = umanager.checkUpgrade(pshop);
		rupgs = !rupgs;
	}, 1000);

	// define variables
	let money = pshop.w_money;
	let beans = pshop.w_beans;
	let coffee = pshop.w_coffeeCups;
	let appeal = pshop.w_appeal;
	let groundedBeans = pshop.w_groundCoffee;
	let waitingCustomers = pshop.w_waitingCustomers;
	let beanPrice = pshop.w_beanPrice;
	let grindProg = pshop.w_grindProgress;
	let canMakeCoffee = pshop.w_canMakeCoffee;
	let makeCoffeeTime = pshop.w_makeCoffeeTime;
</script>

{#snippet upgrade(upgkey: string)}
	<Button
		data-btn="coin"
		disabled={$money < upgs_cost[upgkey] ? true : false}
		onclick={() => {
			umanager.applyUpgrade(upgkey, pshop);
			upgs_cost[upgkey] = umanager.getCost(upgkey, pshop);
			availableUpgrades = umanager.checkUpgrade(pshop);
			rupgs = !rupgs;
		}}
	>
		<h3>
			{upgs[upgkey].name}{upgs[upgkey].maxLevel != 1
				? ` LVL${(pshop.upgrades.get(upgkey) ?? 0) + 1}`
				: ""}
		</h3>

		<p>{upgs[upgkey].description}</p>
		<p>{$t("cost_stat")}: ${upgs_cost[upgkey].toFixed(2)}</p>
	</Button>
{/snippet}

<main class="shop container" style={pointerStyle}>
	<div class="shop left col">
		<div class="col">
			<h1>{$t("preshop_title")}</h1>
			<p>{$t("money_stat")}: ${$money.toFixed(2)}</p>
			<p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
			<p>{$t("sellableCoffee_stat")}: {Math.floor($coffee)}</p>
		</div>
		<div style="height: 5rem;"></div>
		<p>you have one goal: sell coffee</p>
		<p>click the buttons to the right to start</p>
	</div>

	<div class="shop right row">
		<div class="col">
			<Dropdown title={$t("making_title")}>
				<p>{$t("beans_stat")}: {$beans}</p>
				<!-- button style to showcase how much more to grind -->
				<Button
					data-btn={$grindProg == pshop.grindTime ? "plusOne" : ""}
					style="background: linear-gradient(90deg, var(--accent) 0% {($grindProg /
						pshop.grindTime) *
						100}%, var(--btnbg) {($grindProg / pshop.grindTime) * 100}% 100%);"
					disabled={$beans > 0 ? false : $grindProg > -1 ? false : true}
					onclick={() => {
						pshop.grindBeans();
					}}>{$t("grindBeans_btn")}</Button
				>
				<p>{$t("groundedBeans_stat")}: {$groundedBeans}</p>
				<Button
					data-btn="plusOne"
					style="background: linear-gradient(90deg, var(--accent) 0% {($makeCoffeeTime /
						pshop.makeCoffeeCooldown) *
						100}%, var(--btnbg) {($makeCoffeeTime / pshop.makeCoffeeCooldown) *
						100}% 100%);
						{!$canMakeCoffee ? 'cursor: var(--cwait), wait' : ''}"
					disabled={$canMakeCoffee && $groundedBeans >= 1 ? false : true}
					onclick={() => {
						pshop.makeCoffee();
					}}>{$t("makeCoffee_btn")}</Button
				>
			</Dropdown>

			<Dropdown title={$t("promoting_title")}>
				<p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
				<Button
					data-btn="promote"
					onclick={() => {
						pshop.promoteShop();
					}}>{$t("promote_btn")}</Button
				>
			</Dropdown>

			<Dropdown title={$t("selling_title")}>
				<p>{$t("customersWaiting_stat")}: {$waitingCustomers}</p>
				<p>{$t("sellableCoffee_stat")}: {Math.floor($coffee)}</p>
				<Button
					data-btn="sell-coffee"
					disabled={$waitingCustomers > 0 && $coffee > 0 ? false : true}
					onclick={() => {
						pshop.sellCoffee();
					}}>{$t("sellCoffee_btn")}</Button
				>
			</Dropdown>

			<Dropdown title={$t("shop_title")}>
				<p>{$t("beanPrice_stat")}: ${$beanPrice.toFixed(2)}</p>
				<Button
					data-btn="buy-beans"
					disabled={$money < $beanPrice ? true : false}
					onclick={() => {
						pshop.buyBeans();
					}}>{$t("buyBeans_btn")}</Button
				>
				{#if $money < $beanPrice && $beans < 2 && $groundedBeans < 1}
					<Button
						data-btn="chores-for-beans"
						onclick={() => {
							pshop.choresForBeans();
						}}>{$t("choresForBeans_btn")}</Button
					>
				{/if}
			</Dropdown>
		</div>

		<div class="col">
			<div class="col block">
				<h1>{$t("upgrades_title")}</h1>
				{#key rupgs}
					{#each availableUpgrades as upgkey (upgkey)}
						{@render upgrade(upgkey)}
					{/each}
				{/key}
			</div>
		</div>
	</div>
</main>

<style>
	.shop.right > div {
		width: 50%;
		overflow-y: scroll;
	}
</style>
