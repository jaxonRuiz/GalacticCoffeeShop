<script lang="ts">
	import { t } from "svelte-i18n";
    import { writable } from "svelte/store";
	import Button from "../Button.svelte";
	import { fMoney } from "../Styles.svelte";

	let { development, building, bought } = $props();
</script>

<div class="building-card">
    <p style="font-size: 1.2rem; font-weight: bold;">{building.name}</p>
    <p>Area Size: {building.areaSize} acres</p>
    <p>{development.readBuilding(building)}</p>
    <p>Rent: {fMoney(building.rent)}/day</p>
    <div class="row">
        {#if bought === true}
            <Button
                onclick={() => {
                    development.sellBuilding(building);
                }}
            >
                Sell for: {fMoney(building.sellCost)}
            </Button>
        {/if}
        {#if bought === false}
            <Button
                onclick={() => {
                    development.buyBuilding(building);
                }}
            >
                Buy for: {fMoney(building.sellCost)}
            </Button>
        {/if}
        
    </div>
</div>

<style>
    .building-card {
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(43, 43, 43);
		box-sizing: border-box;
	}
</style>