<script lang="ts">
	import { img } from "../../assets/img";

	let { x, y, type, numerical } = $props();

	const style = `
		position: absolute;
		--x: ${x}px;
		--y: ${y}px;
		--s: 2rem;
	`;
</script>

<div class="boop {type}" {style}>
	{#if type === "plusOne"}
		<img src={img.boop_plusOne} alt="+1" />
	{:else if type === "minusOne"}
		<img src={img.boop_minusOne} alt="-1" />
	{:else if ["plus", "minus", "star"].includes(type)}
		<img src={img[`boop_${type}`]} alt={type} />
	{:else if type === "num"}
		<div>
			<img src={img[`boop_numPlus`]} alt="+" />
			{#each numerical as n}
				<img src={img[`boop_num${n == '.' ? 'Dec' : n}`]} alt={n} />
			{/each}
		</div>
	{:else if type === "coin"}
		{#each { length: 5 } as _}
			<img
				src={img.boop_coin}
				alt="coin"
				class={Math.random() >= 0.5 ? "left" : "right"}
				style={`top: ${Math.floor(Math.random() * 20) - 10}px;
				left: ${Math.floor(Math.random() * 30) - 15}px;`}
			/>
		{/each}
	{/if}
</div>

<style>
	.boop {
		width: var(--s);
		height: var(--s);
		top: calc(var(--y) - var(--s) / 2);
		left: calc(var(--x) - var(--s) / 2);
		img {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
		}
		&.plusOne > img,
		&.minusOne > img,
		&.plus > img,
		&.minus > img,
		&.star > img {
			animation: boop 0.5s ease-out forwards;
		}
		&.coin > img.left {
			animation: fallL 0.5s linear forwards;
		}
		&.coin > img.right {
			animation: fallR 0.5s linear forwards;
		}
		&.num {
			& > div {
				position: absolute;
				height: 100%;
				width: 100%;
				top: 0;
				left: 0;
				display: flex;
				flex-direction: row;
				animation: boop 0.5s ease-out forwards;
				& > img {
					position: relative;
					height: 100%;
					width: auto;
				}
			}
			}
	}
	/* animations */
	@keyframes boop {
		0% {
			transform: translate(0);
		}
		75% {
			opacity: 100%;
		}
		100% {
			transform: translate(calc(1 / 2 * var(--s)), calc(-1 * var(--s)));
			opacity: 0%;
		}
	}
	@keyframes fallL {
		0% {
			transform: translate(0);
		}
		17% {
			transform: translate(calc(-0.5 * var(--s)), calc(-0.5 * var(--s)));
		}
		25% {
			transform: translate(calc(-0.7 * var(--s)), calc(-0.3 * var(--s)));
		}
		75% {
			opacity: 100%;
		}
		100% {
			transform: translate(calc(-1 * var(--s)), calc(2.5 * var(--s)));
			opacity: 0%;
		}
	}
	@keyframes fallR {
		0% {
			transform: translate(0);
		}
		17% {
			transform: translate(calc(0.5 * var(--s)), calc(-0.5 * var(--s)));
		}
		25% {
			transform: translate(calc(0.7 * var(--s)), calc(-0.3 * var(--s)));
		}
		75% {
			opacity: 100%;
		}
		100% {
			transform: translate(calc(1 * var(--s)), calc(2.5 * var(--s)));
			opacity: 0%;
		}
	}
</style>
