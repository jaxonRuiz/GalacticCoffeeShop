<script lang="ts">
	import Button from "../Button.svelte";

	let { upgrade, franchise, sciencePoints, i } = $props();
</script>

<div class="upgrade-card">
    <p style="font-size: 1.3rem;">{upgrade.name}</p>
    <p>{upgrade.desc}</p>
    <p>Costs: {upgrade.cost}</p>
    <Button 
    onclick={() => franchise.buyUpgrade(i)}
    disabled={$sciencePoints < upgrade.cost}
    style = "
        background-color: {$sciencePoints < upgrade.cost ? '#444' : '#515151'};
        cursor: {$sciencePoints < upgrade.cost ? '--cno' : '--cpointer'};
    ">
        Unlock
    </Button>
</div>

<style>
    div.upgrade-card{
		border: 1px solid #444;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.4rem;
		background-color:rgb(28, 28, 28);
		box-sizing: border-box;
	}
</style>