<script lang="ts">
  import { Observer } from "../backend/observer";
  import { Preshop } from "../backend/preshop";
  import { Timer } from "../backend/time";
  import { preshopUpgrades, UpgradeManager } from "../backend/upgradeManager";

  let timer = new Timer();
  let pshop = new Preshop(timer.timeEvents);
  let manager = new UpgradeManager(preshopUpgrades);

  // define variables
  let money = pshop.w_money;
  let beans = pshop.w_beans;
  let appeal = pshop.w_appeal;
  let groundedBeans = pshop.w_groundCoffee;
  let waitingCustomers = pshop.w_waitingCustomers;
</script>

<main>
  <div class="col">
    <h1>coffee stats</h1>
    <p>money: {$money}</p>
    <p>appeal: {$appeal + "/5"}</p>
    <p>coffees made: {pshop.coffeeCups}</p>
  </div>

  <div class="col">
    <h1>making coffee</h1>
    <p>beans: {$beans}</p>
    <button on:click={pshop.grindCoffee}>grind beans</button>
    <p>grounded beans: {$groundedBeans}</p>
    <button on:click={pshop.makeCoffee}>make coffee</button>
  </div>

  <div class="col">
    <h1>selling coffee</h1>
    <p>customers waiting: {$waitingCustomers}</p>
    <button on:click={pshop.sellCoffee}>sell coffee</button>
  </div>

  <div class="col">
    <h1>promoting coffee</h1>
    <button on:click={pshop.promoteShop}>promote</button>
  </div>

  <div class="col">
    <h1>upgrades</h1>
  </div>

  <div class="col">
    <h1>shop</h1>
    <button on:click={pshop.buyBeans}>buy coffee beans</button>
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  h1,
  p {
    text-align: center;
    margin: 10px 0;
  }

  div,
  button {
    margin: 20px;
  }
</style>
