<script lang="ts">
	import Tooltip from "./../components/Tooltip.svelte";
	import { t } from "svelte-i18n";
	import { upgradeJSON } from "../../backend/systems/upgradeManager";
	import { Preshop } from "../../backend/classes/preshop";
	import { Timer } from "../../backend/systems/time";
	import { UpgradeManager } from "../../backend/systems/upgradeManager";
	import { StageManager } from "../../backend/systems/stageManager";
	import Dropdown from "../components/Dropdown.svelte";
	import Button from "../components/Button.svelte";
	import {
		fMoney,
		fAppeal,
		fSellableCoffee,
		pointerStyle,
	} from "../components/Styles.svelte";

	// base
	let timer = new Timer();
	let smanager = new StageManager(timer);
	const mockpshop = new Preshop(timer.timeEvents, smanager);

	let { wshop: pshop = mockpshop } = $props();

	let umanager = new UpgradeManager("preshop");

	// for upgrades
	let rupgs = $state(false);
	let upgPage = $state(0);
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

{#snippet upgrade(upgkey: string, purchased: boolean)}
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
			{$t(`${upgkey}_upgName`)}{upgs[upgkey].maxLevel != 1
				? ` LVL${(pshop.upgrades.get(upgkey) ?? 0) + (purchased ? 0 : 1)}`
				: ""}
		</h3>

		<p>{$t(`${upgkey}_upgDesc`)}</p>
		{#if !purchased}
			<p>{$t("cost_stat")}: {fMoney(upgs_cost[upgkey])}</p>
		{/if}
	</Button>
{/snippet}

<main class="shop container" style={pointerStyle}>
	<div class="shop left col fixed">
		<div class="col">
			<h1>{$t("preshop_title")}</h1>
			<p>{$t("money_stat")}: {fMoney($money)}</p>
			<p>{$t("appeal_stat")}: {fAppeal($appeal)}</p>
			<p>{$t("sellableCoffee_stat")}: {fSellableCoffee($coffee)}</p>
		</div>
		<div style="height: 5rem;"></div>
		<p>you have one goal: sell coffee</p>
		<p>click the buttons to the right to start</p>
	</div>

	<div class="shop right row">
		<div class="col">
			<Dropdown title={$t("making_title")}>
				<div class="tooltip">
					<Tooltip text={["makeCoffee1_tooltip", "makeCoffee2_tooltip"]} />
				</div>
				<p>{$t("beans_stat")}: {$beans}</p>
				<!-- button style to showcase how much more to grind -->
				<Button
					data-btn={$grindProg == pshop.grindTime ? "plus" : ""}
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
					data-btn="plus"
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
				<div class="tooltip">
					<Tooltip text={["promote_tooltip"]} />
				</div>
				<p>{$t("appeal_stat")}: {fAppeal($appeal)}</p>
				<Button
					data-btn="star"
					onclick={() => {
						pshop.promoteShop();
					}}>{$t("promote_btn")}</Button
				>
			</Dropdown>

			<Dropdown title={$t("selling_title")}>
				<div class="tooltip">
					<Tooltip text={["sellCoffee_tooltip"]} />
				</div>
				<p>{$t("customersWaiting_stat")}: {$waitingCustomers}</p>
				<p>{$t("sellableCoffee_stat")}: {fSellableCoffee($coffee)}</p>
				<Button
					data-btn="plus"
					classes={["green"]}
					disabled={$waitingCustomers >= 1 && $coffee >= 1 ? false : true}
					onclick={() => {
						pshop.sellCoffee();
					}}>{$t("sellCoffee_btn")}</Button
				>
			</Dropdown>

			<Dropdown title={$t("shop_title")}>
				<div class="tooltip">
					<Tooltip text={["shop_tooltip"]} />
				</div>
				<p>{$t("beanPrice_stat")}: {fMoney($beanPrice)}</p>
				<Button
					data-btn="coin"
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

		<div class="col block fixed">
			<h1>{$t("upgrades_title")}</h1>
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
			<div class="col" id="upgrades">
				{#if upgPage == 0}
					{#key rupgs}
						{#each availableUpgrades as upgkey (upgkey)}
							{@render upgrade(upgkey, false)}
						{/each}
					{/key}
				{:else if upgPage === 1}
					{#each [...pshop.upgrades.keys()] as upgkey (upgkey)}
						{@render upgrade(upgkey, true)}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</main>

<style>
	.fixed {
		position: sticky;
		top: 0;
	}
	.shop.right > div {
		width: 50%;
		height: 100%;
		/* &:first-child {
			overflow: visible;
		} */
	}
	.tooltip {
		width: 0;
		height: 0;
		margin-left: auto;
		display: flex;
		flex-direction: row-reverse;
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
		overflow-y: auto;
	}
</style>
