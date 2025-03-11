<script lang="ts">
	import { t } from "svelte-i18n";
	import { Preshop } from "../../backend/classes/preshop";
	import {
		upgradeJSON,
		UpgradeManager,
	} from "../../backend/systems/upgradeManager";
	import { stageManager } from "../../backend/game";
	import Tooltip from "./../components/Tooltip.svelte";
	import Dropdown from "../components/Dropdown.svelte";
	import Button from "../components/Button.svelte";
	import {
		fMoney,
		fAppeal,
		fSellableCoffee,
		pointerStyle,
	} from "../components/Styles.svelte";
	import Upgrade from "../components/Upgrade.svelte";
  import { img } from "../../assets/img";

	// base
	let smanager = stageManager;
	const mockpshop: Preshop = smanager.currentScene as Preshop;

	let { wshop: pshop = mockpshop } = $props();

	let umanager = new UpgradeManager("preshop");

	// for upgrades
	let upgPage = $state(0);
	let rupg = $state(false);
	const upgs = upgradeJSON["preshop"];
	const upgs_cost = $state(
		Object.keys(upgs).reduce((costs: { [key: string]: number }, key) => {
			costs[key] = upgs[key].cost;
			return costs;
		}, {})
	);

	// upgrade checker on interval
	let availableUpgrades = $state(umanager.checkUpgrade(pshop));
	umanager.checkUpgrade(pshop).forEach((upgkey) => {
		upgs_cost[upgkey] = umanager.getCost(upgkey, pshop);
	});
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
	let coffeePrice = pshop.w_coffeePrice;
	let beansPerBuy = pshop.w_beansPerBuy;
</script>

<main class="shop container" style={pointerStyle}>
	<div class="shop left col fixed">
		<div class="col">
			<h1>{$t("preshop_title")}</h1>
			<h3>{$t("money_stat")}: {fMoney($money)}</h3>
		</div>
		<div id="main-art">
			<img alt="shop" src={img.coffeeStand} />
			<img alt="rat" src={img.astrorat} class="float" />
		</div>
	</div>

	<div class="shop right row">
		<div class="col scroll">
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
					data-btn="num"
					data-num={`${$coffeePrice.toFixed(2)}`}
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
				<p>{$t("beansPerBuy_stat")}: {$beansPerBuy}</p>
				<Button
					data-btn="coin"
					disabled={$money < $beanPrice ? true : false}
					onclick={() => {
						pshop.buyBeans();
					}}>{$t("buyBeans_btn")}</Button
				>
				{#if $money < $beanPrice && $beans < 2 && $groundedBeans < 1 && $coffee < 1}
					<Button
					 	data-btn="plus"
						onclick={() => {
							pshop.choresForBeans();
						}}>{$t("choresForBeans_btn")}</Button
					>
				{/if}
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
								{money}
								cost={upgs_cost[upgkey]}
								level={pshop.upgrades.get(upgkey) ?? 0}
								flags={upgs[upgkey].flags ?? []}
								onclick={() => {
									umanager.applyUpgrade(upgkey, pshop);
									upgs_cost[upgkey] = umanager.getCost(upgkey, pshop);
									availableUpgrades = umanager.checkUpgrade(pshop);
									rupg = !rupg;
								}}
							/>
						{/each}
					{/key}
				{:else if upgPage === 1}
					{#each [...pshop.upgrades.keys()] as upgkey (upgkey)}
						<Upgrade
							purchased={true}
							item={upgs[upgkey]}
							key={upgkey}
							cost={upgs_cost[upgkey]}
							level={pshop.upgrades.get(upgkey) ?? 0}
						/>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</main>

<style>
	#main-art {
		img[alt="rat"] {
			top: 11%;
			right: 20%;
		}
	}
</style>
