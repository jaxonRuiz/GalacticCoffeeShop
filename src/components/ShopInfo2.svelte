<script lang="ts">
  import { img } from "../assets/img";
</script>

<main>
  {#snippet longUpgrade(num: number)}
    <div class="long upgrade row">
      <img src={img["u"+num]} alt="icon"/>
      <div class="row" style="flex-grow: 1;">
        <div class="col" style="flex-grow: 1;">
          <h3>upgrade {num}</h3>
          <p>cost: {Math.floor(Math.random() * 100)}</p>
        </div>
        <div class="col">
          <button class="purchase">purchase</button>
        </div>
      </div>
    </div>
  {/snippet}

  <p id="ret">{"<< return"}</p>
  <div class="col" id="shop-left">
    <div id="shop-stats">
      <img id="egg" src={img.egg} alt="egg" />
      <div>
        <h1>COFFEE SHOP NO.1203953</h1>
        <p>num coffees made: 42, coffee creation rate: 5.5/s</p>
        <p>current shop rating: 4.5/5</p>
        <p>serviceability: 64%</p>
      </div>
    </div>
    <div class="center" style="flex-grow: 1;">
      <img id="shop-img" src={img.building} alt="building" />
    </div>
  </div>
  <div id="shop-right">
    <div id="shop-upgrades">
      <div id="tabs">
        <div class="selected">upgrades</div>
        <div>map</div>
        <div>items</div>
      </div>
      <div id="tab-content">
        <div>
          {#each { length: 8 }, i}
            {@render longUpgrade(i + 1)}
          {/each}
        </div>
        <div class="center">
          <h1>upgrades purchased: 50</h1>
          <button>make coffee</button>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
  }

  #shop-left {
    flex-grow: 1; /* use shop-right to edit size */
    height: 100%;
    background-color: #333;
  }

  #shop-right {
    width: 60%;
    display: flex;
    flex-direction: column;
  }

  /* smaller things temp? */
  .purchase {
    background-color: #473;
    margin-top: auto;
  }
  img[alt="icon"] {
    width: 4em;
    height: auto;
    object-fit: contain;
  }
  .upgrade {
    margin: 0.5em;
    background-color: #111;
    padding: 0.5em;
  }

  #shop-img {
    width: 100%;
  }
  #egg {
    height: 10em;
  }

  #ret {
    position: absolute;
    top: 15px;
    left: 15px;
  }

  #shop-stats {
    height: 25%;
    background-color: #444;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  #shop-upgrades {
    height: 100%;
  }

  #tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    column-gap: 1em;
    background-color: #111;
  }

  #tab-content {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
  }

  #tab-content > div {
    flex-grow: 1;
    padding: 2em;
  }

  #tabs > div {
    padding: 1em;
    min-width: 20%;
    text-align: center;
  }

  #tabs > div.selected {
    background-color: #242424;
  }
</style>
