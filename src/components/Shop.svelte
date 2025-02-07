<script lang="ts">
  import Dropdown from "./Dropdown.svelte";

</script>

<main class="shop container">
  <div class="shop left col">
    <div class="col">
      <h1>shop name</h1>
      <p>money: ##</p>
      <p>appeal: ##</p>
      <p>sellable coffee: ##</p>
    </div>
  </div>

  <div class="shop right row">
    <div class="col">
      <div class="col block">
        <Dropdown title="making coffee" classes={["col"]}>
          <p>beans: ##</p>
          <p>empty cups: ##</p>
          <button>make coffee</button>
        </Dropdown>
      </div>
      <div class="col block">
        <Dropdown title="selling coffee" classes={["col"]}>
          <p>appeal: ##</p>
          <p>customers waiting: ##</p>
          <button>promote coffee</button>
          <button>sell coffee</button>
        </Dropdown>
      </div>
      <div class="col block">
        <Dropdown title="cleaning shop" classes={["col"]}>
          <p>smth</p>
        </Dropdown>
      </div>
      <div class="col block">
        <Dropdown title="restocking" classes={["col"]}>
          <p>smth</p>
        </Dropdown>
      </div>
    </div>
    <div class="col">
      <div class="col block">
        <h1>upgrades</h1>
      </div>
    </div>
  </div>
</main>

<style>
  .shop.right > div {
    width: 50%;
  }
</style>
