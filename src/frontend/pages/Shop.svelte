<script lang="ts">
  import { MultiShop } from "../../backend/classes/multiShop";
  import { Shop } from "../../backend/classes/shop";
  import { StageManager } from "../../backend/systems/stageManager";
  import { Timer } from "../../backend/systems/time";
  import { UpgradeManager } from "../../backend/systems/upgradeManager";
  import Dropdown from "../components/Dropdown.svelte";
  import { t } from "svelte-i18n";

  let timer = new Timer();
  let smanager = new StageManager(timer);
  let mshop = new MultiShop(timer.timeEvents, smanager);
  let sshop = new Shop(mshop);
  let umanager = new UpgradeManager("shop"); //TODO

	// define variables
	let beans = sshop.w_beans;
	let appeal = sshop.w_appeal;
	let emptyCups = sshop.w_emptyCups;
	let coffeeCups = sshop.w_coffeeCups;
	let customers = sshop.w_waitingCustomers;
	let money = sshop.w_money;
	let cleanness = sshop.w_cleanness;
</script>

<main class="shop container">
  <div class="shop left col">
    <div class="col">
      <h1>shop name</h1>
      <p>{$t("money_stat")}: ${$money.toFixed(2)}</p>
      <p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
      <p>{$t("sellableCoffee_stat")}: {$coffeeCups}</p>
    </div>
  </div>

  <div class="shop right row">
    <div class="col">
      <Dropdown title={$t("making_title")}>
        <p>{$t("beans_stat")}: {$beans}</p>
        <p>{$t("emptyCups_stat")}: {$emptyCups}</p>
        <button
          onclick={() => {
            sshop.produceCoffee();
          }}>{$t("makeCoffee_btn")}</button
        >
      </Dropdown>

      <Dropdown title={$t("selling_title")}>
        <p>{$t("appeal_stat")}: {(100 * $appeal).toFixed(2)}%</p>
        <p>{$t("customersWaiting_stat")}: {$customers}</p>
        <button
          onclick={() => {
            sshop.promote();
          }}>{$t("promote_btn")}</button
        >
        <button
          onclick={() => {
            sshop.sellCoffee();
          }}>{$t("sellCoffee_btn")}</button
        >
      </Dropdown>

      <Dropdown title={$t("cleaning_title")}>
        <p>{$t("cleanness_stat")}: {$cleanness}</p>
				<button>{$t("clean_btn")}</button>
      </Dropdown>

      <Dropdown title={$t("restocking_title")}>
				<!-- TODO -->
        <p>smth</p>
      </Dropdown>
    </div>
    <div class="col">
      <div class="col block">
        <h1>{$t("upgrades_title")}</h1>
      </div>
    </div>
  </div>
</main>

<style>
  .shop.right > div {
    width: 50%;
  }
</style>
