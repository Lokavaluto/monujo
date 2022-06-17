<template>
  <section>
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
  </section>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import TheBankAccountList from "@/components//TheBankAccountList.vue"
  import TheTransactionList from "@/components/TheTransactionList.vue"
  import SendAskMoney from "@/components/SendAskMoney.vue"

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
