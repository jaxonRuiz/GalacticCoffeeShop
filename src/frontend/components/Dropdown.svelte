<script lang="ts">
  import { slide } from 'svelte/transition';
  import { pointerStyle } from './Styles.svelte';
  let { children, title, classes = []} = $props();

  // true = open, false = closed
  let s = $state(true);
</script>

<div class="dpdn col block" style={pointerStyle}>
  <button class="dpdn" onclick={() => (s = !s)}>
    <h1>{title} <span>{s? '-':'+'}</span></h1>
  </button>
  {#if s}
    <div transition:slide class="dpdn content col {classes.join(' ')}">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .dpdn {
    height: fit-content;
    /* covered in shop.css */
    /* transition: max-height 0.2s linear; */
    &.content {
      overflow-y: hidden;
    }

    button {
      margin: 0;
      border: none;
      border-radius: 0;
      border-bottom: 3px solid white;
      background-color: var(--bg2);
      cursor: var(--cpointer), pointer;
    }
  }
</style>
