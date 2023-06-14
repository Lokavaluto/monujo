<template>
  <div class="card custom-card custom-card-padding">
    <div
      class="
        is-flex-direction-column
        is-align-items-center
        is-justify-content-space-between
      "
    >
      <TransactionListRecent :refreshToggle="refreshToggle" />
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import TransactionListRecent from "./TransactionListRecent.vue"

  import { mapModuleState } from "@/utils/vuex"

  @Options({
    name: "TheTransactionList",
    props: {
      refreshToggle: Boolean,
    },
    components: {
      TransactionListRecent,
    },
    computed: {
      ...mapModuleState("lokapi", ["transactionsLoading", "lastTransactions"]),
    },
  })
  export default class TheTransactionList extends Vue {}
</script>

<style lang="scss"></style>
