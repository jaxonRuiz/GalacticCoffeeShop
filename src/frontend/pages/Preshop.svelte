<script lang="ts">
  import { t } from "svelte-i18n";
  import { upgradeJSON } from "../../backend/systems/upgradeManager";
  import { Publisher } from "../../backend/systems/observer";
  import { Preshop } from "../../backend/classes/preshop";
  import { Timer } from "../../backend/systems/time";
  import { UpgradeManager } from "../../backend/systems/upgradeManager";
  import Dropdown from "../components/Dropdown.svelte";
  import { StageManager } from "../../backend/systems/stageManager";

  // base
  let timer = new Timer();
  let smanager = new StageManager(timer);
  const mockpshop = new Preshop(timer.timeEvents, smanager);

  let { wshop: pshop = mockpshop } = $props();

  let umanager = new UpgradeManager("preshop");

  // for upgrades
  const upgs = upgradeJSON["preshop"];
  const upgs_cost = $state(
    Object.keys(upgs).reduce((costs: { [key: string]: number }, key) => {
      costs[key] = upgs[key].cost;
      return costs;
    }, {})
  );

  // upgrade checker on interval
  let availableUpgrades = $state(umanager.checkUpgrade(pshop));
  setInterval(() => {
    availableUpgrades = umanager.checkUpgrade(pshop);
  }, 1000);

  // define variables
  let money = pshop.w_money;
  let beans = pshop.w_beans;
  let coffee = pshop.w_coffeeCups;
  let appeal = pshop.w_appeal;
  let groundedBeans = pshop.w_groundCoffee;
  let waitingCustomers = pshop.w_waitingCustomers;
  let beanPrice = pshop.w_beanPrice;
  let grindProg = pshop.w_grindProgress;
  let canMakeCoffee = pshop.w_canMakeCoffee;
  let makeCoffeeTime = pshop.w_makeCoffeeTime;
</script>

{#snippet upgrade(upgkey: string)}
  <button
    disabled={$money < upgs_cost[upgkey] ? true : false}
    onclick={() => {
      umanager.applyUpgrade(upgkey, pshop);
      upgs_cost[upgkey] = umanager.getCost(upgkey, pshop);
      availableUpgrades = umanager.checkUpgrade(pshop);
    }}
  >
    <h3>{upgs[upgkey].name}</h3>
    <p>{upgs[upgkey].description}</p>
    <p>{$t("cost_stat")}: ${upgs_cost[upgkey].toFixed(2)}</p>
  </button>
{/snippet}

<main class="shop container">
  <div class="shop left col">
    <div class="col">
      <h1>{$t("preshop_title")}</h1>
      <p>{$t("money_stat")}: ${$money.toFixed(2)}</p>
      <p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
      <p>{$t("sellableCoffee_stat")}: {$coffee}</p>
    </div>
  </div>

  <div class="shop right row">
    <div class="col">
      <Dropdown title={$t("stats_title")}>
        <p>{$t("beans_stat")}: {$beans}</p>
        <!-- button style to showcase how much more to grind -->
        <button
          style="background: linear-gradient(90deg, #aa1a1a 0% {($grindProg /
            pshop.grindTime) *
            100}%, #1a1a1a {($grindProg / pshop.grindTime) * 100}% 100%);"
          disabled={$beans > 0 ? false : $grindProg > -1 ? false : true}
          onclick={() => {
            pshop.grindBeans();
          }}>{$t("grindBeans_btn")}</button
        >
        <p>{$t("groundedBeans_stat")}: {$groundedBeans}</p>
        <button
          style="background: linear-gradient(90deg, #aa1a1a 0% {($makeCoffeeTime /
            pshop.makeCoffeeCooldown) *
            100}%, #1a1a1a {($makeCoffeeTime / pshop.makeCoffeeCooldown) *
            100}% 100%);"
          disabled={$canMakeCoffee && $groundedBeans >= 1 ? false : true}
          onclick={() => {
            pshop.makeCoffee();
          }}>{$t("makeCoffee_btn")}</button
        >
      </Dropdown>

      <Dropdown title={$t("promoting_title")}>
        <p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
        <button
          onclick={() => {
            pshop.promoteShop();
          }}>{$t("promote_btn")}</button
        >
      </Dropdown>

      <Dropdown title={$t("selling_title")}>
        <p>{$t("customersWaiting_stat")}: {$waitingCustomers}</p>
        <button
          disabled={$waitingCustomers > 0 && $coffee > 0 ? false : true}
          onclick={() => {
            pshop.sellCoffee();
          }}>{$t("sellCoffee_btn")}</button
        >
      </Dropdown>

      <Dropdown title={$t("shop_title")}>
        <p>{$t("beanPrice_stat")}: ${$beanPrice.toFixed(2)}</p>
        <button
          disabled={$money < $beanPrice ? true : false}
          onclick={() => {
            pshop.buyBeans();
          }}>{$t("buyBeans_btn")}</button
        >
      </Dropdown>
    </div>

    <div class="col">
      <div class="col block">
        <h1>{$t("upgrades_title")}</h1>
        {#each availableUpgrades as upgkey}
          {@render upgrade(upgkey)}
        {/each}
      </div>
    </div>
  </div>
</main>

<style>
  .shop.right > div {
    width: 50%;
  }
</style>
