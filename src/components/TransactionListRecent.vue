<template>
  <loading
    v-model:active="isLoadingTransactions"
    :can-cancel="false"
    :is-full-page="false"
  />
  <div v-if="!isLoadingTransactions">
    <div
      class="notification is-danger is-light"
      v-if="hasTransactionsLoadingError"
    >
      <p class="mb-4">
        {{ $t('transactions.list.msg_error_loading_last_operations') }}
      </p>
      <p class="mb-4">
        {{ $t('transactions.list.msg_error_loading_last_operations_2') }}
      </p>
    </div>
    <p v-else-if="getRecentTransactions?.length === 0" class="notification is-default">
      {{ $t('transactions.list.msg_no_operation') }}
    </p>
    <div v-else>
      <h2 class="custom-card-title">Opérations</h2>
      <TransactionItem
        v-for="transaction in getRecentTransactions"
        :key="transaction"
        :amount="transaction.amount"
        :symbol="transaction.currency"
        :desc="transaction.description"
        :date="dateFormated(transaction.date)"
        :unformatedDate="transaction.date"
        :name="
          transaction.relatedUser
            ? transaction.relatedUser.display
            : transaction.related.type.name
        "
        picto="QR"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import TransactionItem from "./TransactionItem.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/vue-loading.css"

  @Options({
    name: "TransactionListRecent",
    components: {
      TransactionItem,
      Loading,
    },
    data() {
      return {}
    },
    computed: {
      getRecentTransactions(): any {
        return this.$store.state.lokapi.thisWeektransactions
      },
      isLoadingTransactions(): boolean {
        return this.$store.state.lokapi.transactionsLoading
      },
      hasTransactionsLoadingError(): boolean {
        return this.$store.state.lokapi.transactionsLoadingError
      },
    },

    methods: {
      dateFormated(badDate: string): string {
        var date = new Date(badDate)
        var options = { weekday: "long", day: "numeric", month: "numeric" }
        const DateFr = new Intl.DateTimeFormat("fr-FR", options).format(date)
        return DateFr
      },
    },
  })
  export default class TransactionListRecent extends Vue {}
</script>
