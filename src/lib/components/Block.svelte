<script lang="ts">
	let { children, title, classes = []} = $props();

	// NOTE
	// this used to be a dropdown which is where "DPDN" comes from
</script>

<div class="dpdn col block">
	<div class="dpdn header">
		<h1>{title} <span></span></h1>
	</div>
		<div class="dpdn content col {classes.join(' ')}">
			{@render children()}
		</div>
</div>

<style>
	.dpdn {
		height: fit-content;

		.header {
			margin: 0;
			border: none;
			border-radius: 0;
			border-bottom: var(--borderStyle);
		}
	}
</style>
