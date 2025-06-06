<script lang="ts">
	import { t } from "svelte-i18n";
	import { onDestroy } from "svelte";
	import { MultiShop } from "$lib/backend/classes/multiShop";
	import { stageManager } from "$lib/backend/game";
	import { fMoney, pointerStyle } from "$lib/components/Styles.svelte";
	import Button from "$lib/components/Button.svelte";
	import { img } from "$lib/assets/img";
	import UpgradesPanel from "$lib/components/UpgradesPanel.svelte";

	const mshop = stageManager.currentScene as MultiShop;

	// shop money checker on interval
	let shopMoney = $state([mshop.shops[0].money]);
	let shopBeans = $state([mshop.shops[0].beans]);
	let shopIncome = $state([mshop.shops[0].incomePerSecond]);
	const timerInterval = setInterval(() => {
		let moneyHold: number[] = [];
		let incomeHold: number[] = [];
		let beanHold: number[] = [];
		mshop.shops.forEach((shop, ind) => {
			moneyHold[ind] = shop.money;
			incomeHold[ind] = shop.incomePerSecond;
			beanHold[ind] = shop.beans;
		});
		shopMoney = moneyHold;
		shopIncome = incomeHold;
		shopBeans = beanHold;
	}, 250);
	onDestroy(() => {
		clearInterval(timerInterval);
	});

	// define variables
	let money = mshop.w_money;
	let shops = mshop.w_shops;
	let restockUnlocked = mshop.w_multiShopRestockUnlocked;

	// two variables for unlocking and toggling.
	let autoRestockToggled = mshop.w_multiShopAutoRestockToggled;
	let autoRestockUnlocked = mshop.w_multiShopAutoRestockUnlocked;
</script>

<main class="row shop" style={pointerStyle}>
	<div class="col left">
		<div class="row top">
			<div class="col stats">
				<h1>{$t("multishop_title")}</h1>
				<h3>{$t("money_stat")}: {fMoney($money)}</h3>
				<Button
					onclick={() => {
						mshop.withdrawAll();
					}}
				>
					{$t("extractMoney_btn")}
				</Button>
			</div>
			<div id="main-art">
				<img alt="rat" src={img.astrorat} class="float" />
				<img alt="coffee" src={img.coffee} class="float" />
			</div>
		</div>

		<div class="row shop-cards scroll">
			{#each $shops as _shop, ind (ind)}
				{@render card(ind)}
			{/each}
		</div>
	</div>

	<div class="col right">
		<UpgradesPanel wshop={mshop} umKey="multiShop" {money} influence={false} />
	</div>
</main>

{#snippet card(ind: number)}
	<div class="card-holder">
		{#if $restockUnlocked}
			<button 
				onclick={() => {
					mshop.shops[ind].restock();
				}}>
				{$t("restockLocal_btn")}
			</button>
		{/if}
		<button
			class="card col"
			onclick={() => {
				mshop.selectShopIndex(ind);
			}}
		>
			<h1>{$t("shop_title")} {ind + 1}</h1>
			<p>{$t("money_stat")}: {fMoney(shopMoney[ind] ?? 0)}</p>
			<p>{$t("income_stat")}: {fMoney(shopIncome[ind] ?? 0)}</p>
			<p>{$t("beans_stat")}: {shopBeans[ind] ?? 0}</p>
		</button>
	</div>
{/snippet}

<style>
	button {
		cursor: var(--cpointer), pointer;
	}
	.shop {
		height: 100%;
		width: 100%;
		.left {
			width: 70%;
			background-color: var(--bg1);
		}
		.right {
			width: 30%;
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
			width: 12rem;
			flex-shrink: 0;
			justify-content: space-evenly;
			box-sizing: border-box;
		}
	}
	.card-holder {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	#main-art {
		width: auto;
		height: 80%;

		img[alt="rat"] {
			width: 50%;
			top: 15%;
			left: 35%;
		}
		img[alt="coffee"] {
			width: 15%;
			animation-delay: 0.5s;
			top: 60%;
			left: 30%;
		}
	}
</style>
