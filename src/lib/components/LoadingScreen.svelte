<script>
	import { img } from "$lib/assets/img";
	import { loading } from "./LoadingScreen";
</script>

<div id="loading-screen" class={$loading ? "loading" : "loaded"}>
	<div class="text-container imgs">
		<div class="text">
			<h2>space fact</h2>
			<p>coffee doesn't stay hot for long here...</p>
		</div>
	</div>
	<div class="steam imgs">
		<img src={img.loading_steam_1} alt="steam1" style="animation-delay: 0s;" />
		<img
			src={img.loading_steam_2}
			alt="steam2"
			style="animation-delay: 1.5s;"
		/>
		<!-- <img src={img.loading_steam_3} alt="steam3" style="animation-delay: 1s;"/> -->
	</div>
	<div class="coffee imgs">
		<img src={img.loading_coffee} alt="coffee" />
	</div>
	<div class="bg imgs">
		<img src={img.loading_stars_1} alt="bg1" style="animation-delay: 0s;" />
		<img src={img.loading_stars_2} alt="bg2" style="animation-delay: -5s;" />
		<img src={img.loading_stars_3} alt="bg3" style="animation-delay: -3s;" />
	</div>
</div>

<style>
	#loading-screen {
		position: fixed;
		z-index: 10000;
		top: -25vh;
		left: -25vw;
		width: 150vw;
		height: 150vh;

		pointer-events: none;
		background-color: var(--bg1);

		display: grid;
		place-items: center;

		&.loading {
			opacity: 1;
			* {
				animation-play-state: running !important;
			}
		}
		&.loaded {
			opacity: 0;
			* {
				animation-play-state: paused !important;
			}
		}

		.imgs {
			width: 0;
			height: 0;
			position: absolute;
			img {
				position: absolute;
				height: 100vh;
				width: auto;
				transform-origin: center;
				transform: translate(-50%, -50%);
			}
		}

		.bg img {
			opacity: 0;
			animation: blink 5s infinite;
		}

		.coffee {
			animation: coffee 3s linear infinite alternate;
		}

		.steam img {
			opacity: 0;
			animation: steam 3s linear infinite normal;
		}

		.text {
			transform: translateX(-50%);
			margin-top: 5rem;
			width: 30%;
			min-width: 400px;
			* {
				text-align: center;
			}
		}
	}

	@keyframes blink {
		0% {
			opacity: 0.1;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.1;
		}
	}

	@keyframes coffee {
		from {
			transform: translateY(-0.5rem);
		}
		to {
			transform: translateY(0.5rem);
		}
	}

	@keyframes steam {
		0% {
			opacity: 0;
			transform: translateX(-50%) translateY(-47%);
		}
		25% {
			opacity: 0.7;
		}
		75% {
			opacity: 0;
			transform: translateX(-50%) translateY(-55%);
		}
		100% {
			opacity: 0;
			transform: translateX(-50%) translateY(-55%);
		}
	}
</style>
