<script lang="ts">
  let { children, title, classes } = $props();

  // true = open, false = closed
  let s = $state(true);
</script>

<div class="dpdn col">
  <button class="dpdn" onclick={() => (s = !s)}>
    <h1>{title} <span>{s? '^':'v'}</span></h1>
  </button>
  <div class="dpdn content {s ? 'open' : ''} {classes.join(' ')}">
    {@render children()}
  </div>
</div>

<style>
  .dpdn {
    height: fit-content;
    /* covered in shop.css */
    /* transition: max-height 0.2s linear; */
    &.content {
      max-height: 0;
      overflow-y: hidden;
      &.open {
        max-height: 50vh;
      }
    }

    button {
      margin: 0;
    }
  }
</style>
