<script lang="ts">
	import { t } from "svelte-i18n";
    import { writable } from "svelte/store";
	import Button from "../Button.svelte";
	import { fMoney } from "../Styles.svelte";

	let { region, building, bought } = $props();
</script>

<div class="building-card">
    <p style="font-size: 1.2rem; font-weight: bold;">{building.name}</p>
    <p>Area Size: {building.areaSize} acres</p>
    <p>{region.readBuilding(building)}</p>
    <p>Rent: {fMoney(building.rent)}/day</p>
    <div class="row">
        <div class="buttons">
            {#if bought === true}
                <Button
                    style = "background-color:rgb(70, 70, 70);"
                    onclick={() => {
                        region.sellBuilding(building);
                    }}
                >
                    Sell for: {fMoney(building.sellCost)}
                </Button>
            {/if}
        </div>
            
        {#if bought === false}
            <Button
                style = "background-color:rgb(70, 70, 70);"
                onclick={() => {
                    region.buyBuilding(building);
                }}
            >
                Buy for: {fMoney(building.buyCost)}
            </Button>
        {/if}
        
    </div>
</div>

<style>
    .building-card {
		border: 1px solid #393939;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(43, 43, 43);
		box-sizing: border-box;
	}
    div.buttons{
        gap: 2rem;
        display: flex;
    }
</style>