<script lang="ts">
</script>

<main>
  <script type="module" src="/src/backend/game.ts"></script>

  <p>jaxon test ground</p>

  <p>lyssa testing</p>
  <div class="lyssa-testing">
    <grid>
      {#each { length: 10 }, i}
        {#each { length: 10 }, j}
          <div class="cell">{i},{j}</div>
        {/each}
      {/each}
    </grid>
  </div>
  <div class="lyssa-testing"></div>
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
  grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(10, 1fr);
    width: fit-content;
    height: fit-content;

    /* important */
    transform-origin: center;
    transform: rotateX(60deg) rotateY(0deg) rotateZ(45deg);

    div {
      width: 50px;
      height: 50px;
    }
  }
</style>
