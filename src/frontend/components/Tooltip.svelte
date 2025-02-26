<script lang="ts">
	import { t } from "svelte-i18n";
  import { fade } from "svelte/transition";
  import { img } from "../../assets/img";
  import { pointerStyle } from "./Styles.svelte";

	const { type = "top", text } = $props();
  let open = $state(false);
</script>

<div class="tooltip {type}" style={pointerStyle}>
  <button
    class="fl"
    onclick={() => {
      open = !open;
    }}
  >
    <img alt="tooltip icon" src={img.tooltip} />
  </button>
  {#if open}
    <div transition:fade class="tringle {type}"></div>
    <div transition:fade class="tooltip-content {type}">
			 	{#each text as key}
					<p>{$t(`${key}`)}</p>
				{/each}
    </div>
  {/if}
</div>

<style>
  .tooltip {
    --bg: #000;
    --s: 1rem;
		--b: 2.5rem;
		position: absolute;
    width: var(--b);
    height: var(--b);
		display: flex;
		align-items: center;
		z-index: 50;
    img {
      width: 100%;
      height: 100%;
      /* opacity: 0.7; */
    }
    div,
    p {
      margin: 0;
    }
    &.bot {
      flex-direction: column;
    }
		&.top {
			flex-direction: column-reverse;
		}
		&.right {
			flex-direction: row;
		}
		&.left {
			flex-direction: row-reverse;
		}
  }
  button {
    width: var(--b);
    height: var(--b);
		padding: 0.2rem;
    background-color: transparent;
    &:hover {
      border: transparent solid 1px;
      background-color: transparent;
      cursor: var(--cpointer), pointer;
    }
  }
  .tooltip-content {
    background-color: var(--bg);
    padding: 0.5rem;
    height: fit-content;
    border-radius: 0.5rem;
    width: 20rem;
		position: absolute;
		&.bot {
			margin-top: calc(var(--b) + calc(var(--s) * 1.6 / 2));
		}
		&.top {
			margin-bottom: calc(var(--b) + calc(var(--s) * 1.6 / 2));
		}
		&.right {
			margin-left: calc(var(--b) + calc(var(--s) * 1.6 / 2));
		}
		&.left {
			margin-right: calc(var(--b) + calc(var(--s) * 1.6 / 2));
		}
  }
  .tringle {
    width: 0;
    height: 0;
		position: absolute;
    &.bot {
			margin-top: calc(var(--b));
      border-right: calc(var(--s) / 2) solid transparent;
      border-left: calc(var(--s) / 2) solid transparent;
      border-bottom: calc(var(--s) * 1.732 / 2) solid var(--bg);
    }
		&.top {
			margin-bottom: calc(var(--b));
      border-right: calc(var(--s) / 2) solid transparent;
      border-left: calc(var(--s) / 2) solid transparent;
      border-top: calc(var(--s) * 1.732 / 2) solid var(--bg);
    }
		&.right {
			margin-left: calc(var(--b));
      border-top: calc(var(--s) / 2) solid transparent;
      border-bottom: calc(var(--s) / 2) solid transparent;
      border-right: calc(var(--s) * 1.732 / 2) solid var(--bg);
    }
		&.left {
			margin-right: calc(var(--b));
      border-top: calc(var(--s) / 2) solid transparent;
      border-bottom: calc(var(--s) / 2) solid transparent;
      border-left: calc(var(--s) * 1.732 / 2) solid var(--bg);
    }
  }
</style>
