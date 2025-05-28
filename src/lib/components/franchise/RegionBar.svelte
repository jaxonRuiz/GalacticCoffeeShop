<script lang="ts">
	let { region, style = "" } = $props();
	let totalArea = region?.w_totalArea;
	let unusableLand = region?.w_unusableLand;
	let usableLand = region?.w_usableLand;
</script>

<div class="bar-container" style={style}>
	<div
		class="unusable"
		style="width: {($unusableLand / $totalArea) * 100}%;"
		title="Unusable land"
	>
	</div>
	
	<div
		class="usable-filled"
		style="width: {($usableLand / $totalArea) * 100}%;"
		title="Usable (filled)"
	>
	</div>
	<div
		class="unfilled"
		style="width: {((($totalArea - $unusableLand) - $usableLand) / $totalArea) * 100}%;"
		title="Usable (unfilled)"
	>
	</div>
</div>




<style>
	.bar-container {
		width: 20%;
		height: 20px;
		background-color: #ccc;
		border-radius: 4px;
		overflow: hidden;
		display: flex;
		flex-direction: row-reverse;
	}


	.usable-filled {
		background-color: gray;
	}

	.unfilled {
		background-color: green;
	}

	.unusable {
		background-color: red;
	}
</style>