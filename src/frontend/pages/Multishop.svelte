<script lang="ts">
	import { t } from "svelte-i18n";
	import { MultiShop } from "../../backend/classes/multiShop";
	import { Timer } from "../../backend/systems/time";
	import { upgradeJSON } from "../../backend/systems/upgradeManager";

	let timer = new Timer();
	// let mshop = new MultiShop(timer.timeEvents, );

	// upgrades
	const upgs = upgradeJSON["multishop"];

	// define variables
	// let money = mshop.w_money;
</script>

<main class="row shop">
	<div class="col left">
		<div class="row top">
			<div class="col stats">
				<h1>multishop</h1>
				<p>{$t("money_stat")}: {"money"}</p>
				<button>{$t("extractMoney_btn")}</button>
			</div>
			<div> imagine graphics here </div>
		</div>

		<div class="row shop-cards">
			{@render card()}
		</div>
	</div>

	<div class="col right">
		<div class="col block">
			<h1>{$t("upgrades_title")}</h1>
		</div>
	</div>
</main>

{#snippet card()}
	<button class="card col">
		<h1>shop name</h1>
		<p>amount of money</p>
	</button>
{/snippet}

<style>
	.shop {
		height: 100%;
		width: 100%;

		.left {
			width: 70%;
			background-color: #333;
		}
		.right {
			flex-grow: 1;
		}
	}

	.shop .left {
		.shop-cards {
			flex-wrap: wrap;
			height: 40%;
		}

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
		.card {
			justify-content: space-evenly;
		}
	}
</style>