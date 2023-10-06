<template>
  <div class="card custom-card custom-card-padding">
    <span
      :class="{
        hide: !isTransactionsLoading,
      }"
      class="icon is-small is-default is-pulled-right is-rounded refresh"
    >
      <fa-icon :class="{ refreshing: isTransactionsLoading }" icon="sync" />
    </span>
    <PendingTopUp
      :account="account"
      :refreshToggle="refreshToggle"
      @triggerTransactionRefresh="trigger"
    />
    <TransactionListRecent
      :account="account"
      :refreshToggle="refreshToggle"
      @triggerTransactionRefresh="trigger"
    />
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"

  import TransactionListRecent from "./TransactionListRecent.vue"
  import PendingTopUp from "./PendingTopUp.vue"

  import { mapModuleState } from "@/utils/vuex"

  @Options({
    name: "TheTransactionList",
    components: {
      TransactionListRecent,
      PendingTopUp,
    },
    props: {
      refreshToggle: Boolean,
      account: Object,
    },
    data() {
      return {
        isTransactionsLoading: false,
      }
    },
    computed: {
      ...mapModuleState("lokapi", ["transactionsLoading", "lastTransactions"]),
    },
    mounted() {
      console.log("TransactionList", this.account)
    },
    methods: {
      trigger(value: boolean) {
        this.isTransactionsLoading = value
      },
    },
  })
  export default class TheTransactionList extends Vue {}
</script>

<style lang="scss">
  .custom-line-separator {
    display: flex;
    height: 5px;
  }
</style>
