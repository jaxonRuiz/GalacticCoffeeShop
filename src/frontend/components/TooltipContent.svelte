<script lang="ts">
	import { t } from "svelte-i18n";
	// import { fade } from 'svelte/transition';
  // rerenders on scroll so cannot keep transition :(
  import { tooltipStyle } from "./Tooltip";
  let { x, y, text, type } = $props();

  let style = $state(`
		position: absolute;
    --x: ${x}px;
    --y: ${y}px;
  `);
</script>

<div style={`${style} ${tooltipStyle}`} class={`container ${type}`}>
  <div class="tringle {type}"></div>
  <div class="tooltip-content {type}">
    {#each text as key}
      <p>{$t(`${key}`)}</p>
    {/each}
  </div>
</div>

<style>
  div.container {
    display: flex;
    align-items: center;
    top: var(--y);
    left: var(--x);
    &.top {
      transform: translateY(-100%) translateX(-50%);
      flex-direction: column-reverse;
    }
    &.bot {
      transform: translateX(-50%);
      flex-direction: column;
    }
    &.right {
      transform: translateY(-50%);
      flex-direction: row;
    }
    &.left {
      transform: translateY(-50%) translateX(-100%);
      flex-direction: row-reverse;
    }
    * {
      text-align: center;
    }
  }

  .tooltip-content {
		background-color: var(--bg);
		padding: 0.5rem;
		height: fit-content;
		border-radius: 0.5rem;
		width: 20rem;
	}
	.tringle {
		width: 0;
		height: 0;
		&.bot {
			border-right: calc(var(--s) / 2) solid transparent;
			border-left: calc(var(--s) / 2) solid transparent;
			border-bottom: calc(var(--s) * 1.732 / 2) solid var(--bg);
		}
		&.top {
			border-right: calc(var(--s) / 2) solid transparent;
			border-left: calc(var(--s) / 2) solid transparent;
			border-top: calc(var(--s) * 1.732 / 2) solid var(--bg);
		}
		&.right {
			border-top: calc(var(--s) / 2) solid transparent;
			border-bottom: calc(var(--s) / 2) solid transparent;
			border-right: calc(var(--s) * 1.732 / 2) solid var(--bg);
		}
		&.left {
			border-top: calc(var(--s) / 2) solid transparent;
			border-bottom: calc(var(--s) / 2) solid transparent;
			border-left: calc(var(--s) * 1.732 / 2) solid var(--bg);
		}
	}
</style>
