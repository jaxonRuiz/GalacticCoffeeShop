<script lang="ts">
  import { upgradeJSON } from "../backend/systems/upgradeManager";
  import { Observer } from "../backend/systems/observer";
  import { Preshop } from "../backend/classes/preshop";
  import { Timer } from "../backend/systems/time";
  import { UpgradeManager } from "../backend/systems/upgradeManager";
  import Dropdown from "./Dropdown.svelte";

  let timer = new Timer();
  let pshop = new Preshop(timer.timeEvents);
  let manager = new UpgradeManager("preshop");

  // for upgrades
  const upgs = upgradeJSON["preshop"];

  // upgrade checker on interval
  let availableUpgrades = $state(manager.checkUpgrade(pshop));
  setInterval(() => {
    availableUpgrades = manager.checkUpgrade(pshop);
  }, 1000);

  // define variables
  let money = pshop.w_money;
  let beans = pshop.w_beans;
  let appeal = pshop.w_appeal;
  let groundedBeans = pshop.w_groundCoffee;
  let waitingCustomers = pshop.w_waitingCustomers;
  let beanPrice = pshop.w_beanPrice;
  let grindProg = pshop.w_grindProgress;

  // dropdowns (true = open, false = closed)
  let dpdn_make = $state(true);
</script>

{#snippet upgrade(upgkey: string)}
  <button
    disabled={$money < upgs[upgkey].cost ? true : false}
    onclick={() => {
      console.log("clicked", upgkey);
      manager.applyUpgrade(upgkey, pshop);
      availableUpgrades = manager.checkUpgrade(pshop);
    }}
  >
    <h3>{upgs[upgkey].name}</h3>
    <p>{upgs[upgkey].description}</p>
    <p>cost: ${upgs[upgkey].cost.toFixed(2)}</p>
  </button>
{/snippet}

<main class="shop container">
  <div class="shop left col">
    <div class="col">
      <h1>Coffee Stats</h1>
      <p>Money: ${$money.toFixed(2)}</p>
      <p>Appeal: {(100 * $appeal).toFixed(2) + "%"}</p>
      <p>Sellable Coffee: {pshop.coffeeCups}</p>
    </div>
  </div>

  <div class="shop right row">
    <div class="col">
      <div class="col block">
        <Dropdown title="making coffee" classes={["col"]}>
          <p>beans: {$beans}</p>
          <!-- button style to showcase how much more to grind -->
          <button
            style="background: linear-gradient(90deg, #aa1a1a 0% {($grindProg /
              pshop.grindTime) *
              100}%, #1a1a1a {($grindProg / pshop.grindTime) * 100}% 100%);"
            disabled={$beans > 0 ? false : $grindProg > -1 ? false : true}
            onclick={() => {
              pshop.grindBeans();
            }}>grind beans</button
          >
          <p>grounded beans: {$groundedBeans}</p>
          <button
            disabled={$groundedBeans > 0 ? false : true}
            onclick={() => {
              pshop.makeCoffee();
            }}>make coffee</button
          >
        </Dropdown>
      </div>

      <div class="col block">
        <Dropdown title="promoting coffee" classes={["col"]}>
          <p>appeal: {(100 * $appeal).toFixed(2) + "%"}</p>
          <button
            onclick={() => {
              pshop.promoteShop();
            }}>promote</button
          >
        </Dropdown>
      </div>

      <div class="col block">
        <Dropdown title="selling coffee" classes={["col"]}>
          <p>customers waiting: {$waitingCustomers}</p>
          <button
            disabled={$waitingCustomers > 0 ? false : true}
            onclick={() => {
              pshop.sellCoffee();
            }}>sell coffee</button
          >
        </Dropdown>
      </div>

      <div class="col block">
        <Dropdown title="shop" classes={["col"]}>
          <p>Bean Price: ${$beanPrice.toFixed(2)}</p>
          <button
            disabled={$money < $beanPrice ? true : false}
            onclick={() => {
              pshop.buyBeans();
            }}>buy coffee beans</button
          >
        </Dropdown>
      </div>
    </div>

    <div class="col">
      <div class="col block">
        <h1>upgrades</h1>
        {#each availableUpgrades as upgkey}
          {@render upgrade(upgkey)}
        {/each}
      </div>
    </div>
  </div>
</main>

<style>
  h1,
  p {
    text-align: center;
    margin: 10px 0;
    width: 100%;
  }

  div.block,
  button {
    margin: 20px;
  }
  div.block {
    margin-bottom: 0;
  }

  .shop.right > div {
    width: 50%;
  }
</style>
