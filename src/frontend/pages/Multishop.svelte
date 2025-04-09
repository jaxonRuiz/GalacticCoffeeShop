<script lang="ts">
	import { t } from "svelte-i18n";
	import { MultiShop } from "../../backend/classes/multiShop";
	import { stageManager } from "../../backend/game";
	import Shop from "./Shop.svelte";
	import { fMoney, pointerStyle } from "../components/Styles.svelte";
	import Button from "../components/Button.svelte";
	import { img } from "../../assets/img";
	import { onDestroy } from "svelte";
	import UpgradesPanel from "../components/UpgradesPanel.svelte";

	const mockmshop = stageManager.currentScene as MultiShop;

	let { wshop: mshop = mockmshop } = $props();

	// shop money checker on interval
	let shopMoney = $state([mshop.shops[0].money]);
	const timerInterval = setInterval(() => {
		let hold: number[] = [];
		mshop.shops.forEach((shop, ind) => {
			hold[ind] = shop.money;
		});
		shopMoney = hold;
	}, 500);
	onDestroy(() => {
		clearInterval(timerInterval);
	});

	// using shops
	let sshopInd = $state(0);

	// define variables
	let money = mshop.w_money;
	let shops = mshop.w_shops;
</script>

{#if sshopInd < 0}
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
			<UpgradesPanel
				wshop={mshop}
				umKey="multiShop"
				money={money}
			/>
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
			mshop.selectShopIndex(ind);
		}}
	>
		<h1>{$t("shop_title")} {ind + 1}</h1>
		<p>{$t("money_stat")}: {fMoney(shopMoney[ind] ?? 0)}</p>
	</button>
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
