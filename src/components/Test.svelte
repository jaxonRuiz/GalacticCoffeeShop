<script lang="ts">
</script>

<main>
  <script type="module" src="/src/backend/game.ts"></script>

  <p>jaxon test ground</p>

  <p>lyssa testing</p>
  <div class="lyssa-testing">
    <grid>
      {#each { length: 5 }, i}
        {#each { length: 5 }, j}
          <div class="cell">
            {#if i == 2 && j == 2}
              <div class="wall">wall</div>
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

  div.wall {
    width: 100%;
    height: 100%;
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
    }
  }
</style>
