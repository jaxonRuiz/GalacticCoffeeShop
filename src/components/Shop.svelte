<script lang="ts">
  import Dropdown from "./Dropdown.svelte";
  import { t } from "svelte-i18n";
</script>

<main class="shop container">
  <div class="shop left col">
    <div class="col">
      <h1>shop name</h1>
      <p>{$t("money_stat")}: ##</p>
      <p>{$t("appeal_stat")}: ##</p>
      <p>{$t("sellableCoffee_stat")}: ##</p>
    </div>
  </div>

  <div class="shop right row">
    <div class="col">
      <div class="col block">
        <Dropdown title={$t("making_title")} classes={["col"]}>
          <p>{$t("beans_stat")}: ##</p>
          <p>{$t("emptyCups_stat")}: ##</p>
          <button>{$t("makeCoffee_btn")}</button>
        </Dropdown>
      </div>
      <div class="col block">
        <Dropdown title={$t("selling_title")} classes={["col"]}>
          <p>{$t("appeal_stat")}: ##</p>
          <p>{$t("customersWaiting_stat")}: ##</p>
          <button>{$t("promote_btn")}</button>
          <button>{$t("sellCoffee_btn")}</button>
        </Dropdown>
      </div>
      <div class="col block">
        <Dropdown title={$t("cleaning_title")} classes={["col"]}>
          <p>smth</p>
        </Dropdown>
      </div>
      <div class="col block">
        <Dropdown title={$t("restocking_title")} classes={["col"]}>
          <p>smth</p>
        </Dropdown>
      </div>
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
