<script lang="ts">
  import { currentScene } from "../../backend/game";

  // let cs = currentScene;
  let cs = $state(currentScene);
</script>

<main>
	<!-- <script type="module" src="/src/backend/game.ts"></script> -->

	<p>jaxon test ground</p>
  <button
    onclick={() => {
      console.log("click");
      cs.endScene();
    }}>
    TEST
    <!-- cs.endScene(); -->
  </button>

	<p>lyssa testing</p>
	<div class="lyssa-testing">
		<grid>
			{#each { length: 5 }, i}
				{#each { length: 5 }, j}
					<div class="cell">
						{#if i == 2 && j == 2}
							<div class="wall left">left wall</div>
							<div class="wall right">right wall</div>
							<div class="wall ceiling">ceiling</div>
						{:else if i == 1 && j == 3}
							<div class="sprite">front-facing sprite</div>
						{:else}
							{i},{j}
						{/if}
					</div>
				{/each}
			{/each}
		</grid>
	</div>
</main>

<style>
	div.lyssa-testing {
		width: 800px;
		height: 800px;
		position: relative;
		& > * {
			position: absolute;
		}
	}

	* {
		transform-style: preserve-3d !important;
	}

	div.sprite {
		width: 80px;
		height: 80px;
		background-color: #fa0;
		transform: rotateZ(-45deg) rotateX(-60deg);
	}

	div.wall {
		width: 100%;
		height: 100%;
		background-color: #111;

		&.left {
			transform-origin: bottom;
			transform: rotateX(-90deg);
		}
		&.right {
			transform-origin: bottom right;
			transform: rotateX(-90deg) rotateY(90deg) translateX(80px);
		}
		&.ceiling {
			transform: translateZ(80px);
		}
	}


	grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(5, 1fr);
		width: fit-content;
		height: fit-content;

		/* important */
		transform-origin: center;
		transform: rotateX(60deg) rotateY(0deg) rotateZ(45deg);
		div {
			width: 80px;
			height: 80px;
			background-color : #ddd;
			
			& > * {
				position: absolute;
			}
		}
	}
</style>
