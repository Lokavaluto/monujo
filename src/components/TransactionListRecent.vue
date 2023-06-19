<template>
  <loading
    v-if="!transactions.length"
    v-model:active="isTransactionsLoading"
    :can-cancel="false"
    :is-full-page="false"
  />
  <div
    id="the-transaction-list"
    v-if="!isTransactionsLoading || transactions.length"
  >
    <span
      :class="{
        hide: !isTransactionsLoading,
      }"
      class="icon is-small is-default is-pulled-right is-rounded refresh"
    >
      <fa-icon :class="{ refreshing: isTransactionsLoading }" icon="sync" />
    </span>
    <div
      class="notification is-danger is-light"
      v-if="isTransactionsLoadingError"
    >
      <p class="mb-4">
        {{
          $gettext(
            "An unexpected issue occurred while loading the last " +
              "transactions. Sorry for the inconvenience."
          )
        }}
      </p>
      <p class="mb-4">
        {{
          $gettext(
            "You can try to refresh the page, if the issue persists, " +
              "you may want to contact your administrator"
          )
        }}
      </p>
    </div>
    <p v-else-if="transactions?.length === 0" class="notification is-default">
      {{ $gettext("No previous transactions in your history.") }}
    </p>
    <div v-else>
      <h2 class="custom-card-title">{{ $gettext("Transactions") }}</h2>
      <TransactionItem
        v-for="transaction in transactions"
        :key="transaction"
        :transaction="transaction"
        @click="
          $modal.open('ConfirmPaymentModal', {
            transaction,
            type: 'transactionDetail',
          })
        "
      />
      <div v-if="transactions.length" class="has-text-centered mt-5">
        <button
          @click="
            () => {
              $modal.open('TransactionListModal', { account })
            }
          "
          class="button custom-button custom-inverted"
        >
          {{ $gettext("See more") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import TransactionItem from "./TransactionItem.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/css/index.css"
  import { mapModuleState } from "@/utils/vuex"

  let timeout: any

  function clearRefresh() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  function setupRefresh(fn: () => void, ms: number) {
    clearRefresh()
    timeout = setTimeout(fn, ms)
  }

  @Options({
    name: "TransactionListRecent",
    props: {
      refreshToggle: Boolean, // change of this props requests a refresh
      account: Object,
    },
    components: {
      TransactionItem,
      Loading,
    },
    data(this: any) {
      return {
        transactions: [],
        isTransactionsBatchLoading: false,
        isTransactionsLoading: false,
      }
    },
    mounted() {
      this.setRefreshIfNeeded()
      this.resetTransactionsGen()
    },
    unmounted() {
      clearRefresh()
    },
    computed: {},

    methods: {
      setRefreshIfNeeded() {
        const transactionsRefreshInterval =
          this.$config.transactionsRefreshInterval || 90
        if (transactionsRefreshInterval != -1) {
          setupRefresh(
            this.resetTransactionsGen.bind(this.resetTransactionsGen),
            transactionsRefreshInterval * 1000
          )
        }
      },
      async getNextFilteredTransactions() {
        if (!this.transactionGen) return
        this.isTransactionsLoading = true
        let transactions = []
        while (transactions.length < 5) {
          let next
          try {
            next = await this.transactionGen.next()
          } catch (e) {
            this.isTransactionsLoading = false
            this.$msg.error(
              this.$gettext(
                "An unexpected issue occured while downloading transaction list"
              )
            )
            throw e
          }
          if (next.done) {
            this.transactionGen = null
            break
          }
          transactions.push(<any>next.value)
        }
        this.isTransactionsLoading = false
        this.transactions = transactions
      },
      resetTransactionsGen() {
        if (this.account._obj?.getTransactions) {
          this.transactionGen = this.account._obj.getTransactions()
        } else {
          this.transactionGen = this.account._obj.parent.getTransactions()
        }
        this.$nextTick(() => this.getNextFilteredTransactions())
        this.setRefreshIfNeeded()
      },
    },
    watch: {
      refreshToggle: function () {
        this.resetTransactionsGen()
      },
    },
  })
  export default class TransactionListRecent extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables.scss";

  span.icon {
    color: $top-menu-link-color;
    background-color: transparent;
  }
</style>
