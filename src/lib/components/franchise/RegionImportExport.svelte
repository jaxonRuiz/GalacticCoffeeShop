<script lang="ts">
	import Button from "../Button.svelte";
	import { fMoney } from "../Styles.svelte";

	let { region, franchise, i } = $props();
    let imCap = region?.w_importCapacity;
	let exCap = region?.w_exportCapacity;
    let beansPerHour = region?.w_beansPerHour;
	let estCust = region?.w_expectedCustomersPerHour;
	let maxCoffee = region?.w_maxCoffeePerHour;
</script>

<div class="block">
    <div style="font-size: 1.2rem">Region {i + 1}</div>
    <div>Estimated extra beans: {($beansPerHour * 24) - Math.min(($beansPerHour * 24), ($estCust * 24), ($maxCoffee * 24))}</div>
    <div>Import capacity: {$imCap} <Button onclick={() => {region.increaseImport(100)}}>
            +100 for {fMoney(1000)}
        </Button>
    </div>
    <div>Estimated needed beans: {Math.max(0, Math.min(($estCust * 24), ($maxCoffee * 24)) - ($beansPerHour * 24))}</div>
    <div>Export capacity: {$exCap} <Button onclick={() => {region.increaseExport(100)}}>
            +100 for {fMoney(1000)}
        </Button>
    </div>
    <div>
    </div>
</div>

<style>
    .block{
        position: relative; 
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
		background-color: #1a1a1a;
		box-sizing: border-box;
    }
</style>