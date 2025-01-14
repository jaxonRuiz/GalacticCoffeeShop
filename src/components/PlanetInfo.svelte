<script lang="ts">
  let tabs = [
    {
      id: 'tab1',
      name: 'tab1',
    },
    {
      id: 'tab2',
      name: 'tab2',
    },
    {
      id: 'tab3',
      name: 'tab3',
    },
  ];

  let currentTab = $state(tabs[0]);

</script>

<main>
  <div id="planet-idle">
    <!-- planet positioning sample -->
    <div style="width: 300px; height: 300px;"></div>
  </div>
  <div id="planet-info">
    <div id="planet-info-tabs">
      <div class="tabs">
        {#each tabs as tab, i}
          <label class="tab">
            <input type="radio" name="info-tab" bind:group={currentTab} value={tab} />
            <p>{tab.name}</p>
          </label>
        {/each}
      </div>
      <div class="content">
        <h1>this is tab {currentTab.name}</h1>
      </div>
    </div>
    <div id="planet-info-static"></div>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
  }

  #planet-idle {
    flex-grow: 1; /* use planet-info to edit size */
    height: 100%;
    display: grid;
    place-content: center;
  }

  #planet-info {
    width: 60%;
    display: flex;
    flex-direction: column;
  }

  #planet-info-tabs {
    height: 70%;
    display: flex;
    flex-direction: row;
  }

  #planet-info-static {
    flex-grow: 1; /* use planet-info-tabs to edit size */
  }

  #planet-info-tabs .tabs {
    display: flex;
    flex-direction: column;
  }

  #planet-info-tabs .tab {
    padding: 1em;
  }

  #planet-info-tabs .content {
    flex-grow: 1; /* leftover space from .tabs */
    padding: 1em;
  }

  input[type="radio"] {
    display: none;
  }
</style>
