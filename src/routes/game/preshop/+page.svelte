<script lang="ts">
	import { fly } from "svelte/transition";
	import { t } from "svelte-i18n";
	import { Preshop } from "$lib/backend/classes/preshop";
	import { stageManager } from "$lib/backend/game";
	import Tooltip from "$lib/components/Tooltip.svelte";
	import Dropdown from "$lib/components/Dropdown.svelte";
	import Button from "$lib/components/Button.svelte";
	import {
		fMoney,
		fAppeal,
		fSellableCoffee,
		pointerStyle,
	} from "$lib/components/Styles.svelte";
	import { img } from "$lib/assets/img";
	import UpgradesPanel from "$lib/components/UpgradesPanel.svelte";

	// base
	let smanager = stageManager;
	const pshop: Preshop = smanager.currentScene as Preshop;

	// ui
	let coffeeOnTable = pshop.uiManager.coffees;
	let customersInLine = pshop.uiManager.customers;

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
			<div id="coffees" class="abs">
				{#each $coffeeOnTable as coffee (coffee)}
					<img
						in:fly={{ y: -50, duration: 500 }}
						out:fly={{ y: -50, duration: 500 }}
						alt="coffee"
						src={img.coffee}
						style="
							top: {-45 + coffee[0] * 25}%;
							left: {-14 + coffee[1] * 11.2}%;
							z-index:{coffee[0] + coffee[1]}"
					/>
				{/each}
			</div>
			<div class="customers abs">
				{#each $customersInLine as customer, ind (customer)}
				{console.log(`alien_${customer[0]}_${customer[1]}`)}
					<img
						in:fly={{ y: -50, duration: 500 }}
						out:fly={{ y: -50, duration: 500 }}
						alt="customer"
						src={img[`alien_${customer[0]}_${customer[1]}`]}
						style="
							top: {ind * 10 + 15}%;
							right: {ind * 10 + 25}%;
							z-index:{20 + ind}"
					/>
				{/each}
			</div>
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

		<div class="col">
			<UpgradesPanel wshop={pshop} umKey="preshop" {money} />
		</div>
	</div>
</main>

<style>
	#main-art {
		img[alt="rat"] {
			top: 11%;
			right: 20%;
		}

		#coffees {
			/* border: 1px solid var(--accent); */
			transform-origin: center;
			transform: rotateX(53deg) rotateY(0deg) rotateZ(45deg);
			width: 37%;
			height: 15%;
			right: 21.5%;
			top: 31.8%;

			img {
				transform: rotateZ(-45deg) rotateY(-53deg);
				width: 23%;
			}
		}

		.customers {

			img {
				width: 55%
			}
		}
	}
</style>
