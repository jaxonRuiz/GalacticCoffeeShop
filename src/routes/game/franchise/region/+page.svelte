<script lang="ts">
  import { t } from "svelte-i18n";
  import { stageManager } from "$lib/backend/game";
  import type { Franchise } from "$lib/backend/classes/franchise/franchise";
  import type { Region } from "$lib/backend/classes/franchise/region";

  // base
  const smanager = stageManager;
  const franchise: Franchise = smanager.currentScene as Franchise;
  let region = franchise.w_currentRegion;

  // define variables
  let totalArea = $region!.w_totalArea;
  let unusedLand = $region!.w_unusedLand;
  let devlopmnetList = $region!.w_developmentList;
  let environmentalFactors = $region!.w_environmentalFactors;
  let accessibilityLevel = $region!.w_accessibilityLevel;
  let importCapacity = $region!.w_importCapacity;
  let exportCapacity = $region!.w_exportCapacity;
  let beans = $region!.w_beans;
</script>

<div class="region row">
  <div class="left block">
    <h1>Stats</h1>
    <p>total area: {$totalArea}</p>
    <p>unused land: {$unusedLand}</p>
    <p>accessibility level: {$accessibilityLevel}</p>
    <p>import capacity: {$importCapacity}</p>
    <p>export capacity: {$exportCapacity}</p>
    <p>stockpiled beans: {$beans}</p>

    <h1>Environment</h1>
    <p>soil richness: {$environmentalFactors.soilRichness}</p>
    <p>water availability: {$environmentalFactors.waterAvailability}</p>
    <p>average temperature: {$environmentalFactors.averageTemp}</p>

    <br />

    <p>regions currently don't have a name</p>
  </div>

  <div class="right block"></div>
</div>

<style>
  div.left,
  div.right {
    width: 50%;
  }
</style>
