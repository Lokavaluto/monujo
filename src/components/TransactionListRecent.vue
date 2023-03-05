<template>
  <loading
    v-if="!lastTransactions.length"
    v-model:active="transactionsLoading"
    :can-cancel="false"
    :is-full-page="false"
  />
  <div
    id="the-transaction-list"
    v-if="!transactionsLoading || lastTransactions.length"
  >
    <span
      :class="{
        hide: !transactionsLoading,
      }"
      class="icon is-small is-default is-pulled-right is-rounded refresh"
    >
      <fa-icon :class="{ refreshing: transactionsLoading }" icon="sync" />
    </span>
    <div
      class="notification is-danger is-light"
      v-if="transactionsLoadingError"
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
    <p
      v-else-if="lastTransactions?.length === 0"
      class="notification is-default"
    >
      {{ $gettext("No previous transactions in your history.") }}
    </p>
    <div v-else>
      <h2 class="custom-card-title">{{ $gettext("Transactions") }}</h2>
      <TransactionItem
        v-for="transaction in lastTransactions"
        :key="transaction"
        :transaction="transaction"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import TransactionItem from "./TransactionItem.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/vue-loading.css"
  import { mapModuleState } from "@/utils/vuex"

  let interval: any

  @Options({
    name: "TransactionListRecent",
    components: {
      TransactionItem,
      Loading,
    },
    mounted() {
      const transactionsRefreshInterval =
        this.$config.transactionsRefreshInterval || 90

      if (transactionsRefreshInterval != -1) {
        if (interval) clearInterval(interval)

        interval = setInterval(() => {
          this.$store.dispatch("resetTransactions")
        }, Math.max(10000, transactionsRefreshInterval * 1000))
      }
    },
    unmounted() {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    },
    computed: {
      ...mapModuleState("lokapi", [
        "lastTransactions",
        "transactionsLoading",
        "transactionsLoadingError",
      ]),
    },

    methods: {},
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
