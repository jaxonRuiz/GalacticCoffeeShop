<script lang="ts">
  let gridW: number = 50;
  let gridH: number = 50;

  document.addEventListener(
    "drag",
    (e) => {
      e = e || window.event;
      var dragX = e.pageX,
        dragY = e.pageY;

      console.log("X: " + dragX + " Y: " + dragY);
    },
    false
  );
</script>

<main
  style="
  --gridW: {gridW};
  --gridH: {gridH};
"
>
  <h1>map panning test</h1>
  <div id="map-container">
    <grid id="map" draggable="true">
      {#each { length: gridH }, i}
        {#each { length: gridW }, j}
          <div class="cell">{i},{j}</div>
        {/each}
      {/each}
    </grid>
  </div>
</main>

<style>
  main {
    width: 100%;
    height: 100%;
    display: grid;
    place-content: center;
  }

  .cell {
    width: fit-content;
    height: fit-content;
    user-select: none;
  }

  grid {
    width: fit-content;
    height: fit-content;
    display: grid;
    grid-template-columns: repeat(var(--gridW), 1fr);
    grid-template-rows: repeat(var(--gridH), 1fr);
  }

  #map {
    width: 250px;
    height: 250px;
    overflow: hidden;
  }
</style>
