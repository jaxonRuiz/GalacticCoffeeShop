<script lang="ts">
  import { Observer } from "../backend/observer";
  import { Preshop } from "../backend/preshop";
  import { Timer } from "../backend/time";
  import { UpgradeManager } from "../backend/upgradeManager";

  let timer = new Timer();
  let pshop = new Preshop(timer.timeEvents);
  let manager = new UpgradeManager("preshop");

  // define variables
  let money = pshop.w_money;
  let beans = pshop.w_beans;
  let appeal = pshop.w_appeal;
  let groundedBeans = pshop.w_groundCoffee;
  let waitingCustomers = pshop.w_waitingCustomers;
  let beanPrice = pshop.w_beanPrice;
</script>

<main>
  <div class="col">
    <h1>Coffee Stats</h1>
    <p>Money: ${$money.toFixed(2)}</p>
    <p>Appeal: {(100 * $appeal).toFixed(2) + "%"}</p>
    <p>Sellable Coffee: {pshop.coffeeCups}</p>
  </div>

  <div class="col">
    <h1>making coffee</h1>
    <p>beans: {$beans}</p>
    <button
      on:click={() => {
        pshop.grindBeans();
      }}>grind beans</button
    >
    <p>grounded beans: {$groundedBeans}</p>
    <button
      on:click={() => {
        pshop.makeCoffee();
      }}>make coffee</button
    >
  </div>

  <div class="col">
    <h1>selling coffee</h1>
    <p>customers waiting: {$waitingCustomers}</p>
    <button
      on:click={() => {
        pshop.sellCoffee();
      }}>sell coffee</button
    >
  </div>

  <div class="col">
    <h1>promoting coffee</h1>
    <p>appeal: {(100 * $appeal).toFixed(2) + "%"}</p>
    <button
      on:click={() => {
        pshop.promoteShop();
      }}>promote</button
    >
  </div>

  <div class="col">
    <h1>upgrades</h1>
  </div>

  <div class="col">
    <h1>shop</h1>
    <p>Bean Price: ${$beanPrice.toFixed(2)}</p>
    <button
      on:click={() => {
        pshop.buyBeans();
      }}>buy coffee beans</button
    >
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
