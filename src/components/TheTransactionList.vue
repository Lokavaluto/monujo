<template>
  <div class="card custom-card custom-card-padding">
    <div
      class="
        is-flex-direction-column
        is-align-items-center
        is-justify-content-space-between
      "
    >
      <TransactionListRecent
        :refreshToggle="refreshToggle"
        :account="account"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import TransactionListRecent from "./TransactionListRecent.vue"

  import { mapModuleState } from "@/utils/vuex"

  @Options({
    name: "TheTransactionList",
    components: {
      TransactionListRecent,
    },
    props: {
      refreshToggle: Boolean,
      account: Object,
    },
    computed: {
      ...mapModuleState("lokapi", ["transactionsLoading", "lastTransactions"]),
    },
    mounted() {
      console.log("TransactionList", this.account)
    },
  })
  export default class TheTransactionList extends Vue {}
</script>

<style lang="scss"></style>
