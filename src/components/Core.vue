<template>
  <main class="main">
    <div class="container mt-5">
      <div class="columns is-tablet">
        <div class="column">
          <TheBankAccountList />
        </div>
        <div class="column">
          <TheTransactionList />
        </div>
      </div>
    </div>
    <div class="action-footer-container">
      <div class="container">
        <SendAskMoney />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import TheTransactionList from "./TheTransactionList.vue"
  import SendAskMoney from "./SendAskMoney.vue"
  import TheBankAccountList from "./TheBankAccountList.vue"

  @Options({
    name: "core",
    props: {
      msg: String,
    },
    components: {
      TheTransactionList,
      SendAskMoney,
      TheBankAccountList,
    },
  })
  export default class Core extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
