<template>
  <loading
    v-if="!adminBackends.length"
    v-model:active="currenciesLoading"
    :can-cancel="false"
    :is-full-page="false"
  />
  <div class="active" v-if="!currenciesLoading || adminBackends.length">
    <a
      @click="toggleRefreshBalance()"
      :title="$gettext('Refresh balance and transaction list')"
      class="button is-default is-pulled-right is-rounded refresh"
      :class="{
        'active-refresh-button': currencyRefreshing,
      }"
    >
      <span :class="{ hide: currencyRefreshing }">
        {{ $gettext("Refresh") }}
      </span>
      <span class="icon is-small">
        <fa-icon
          :class="{
            refreshing: currencyRefreshing,
          }"
          icon="sync"
        />
      </span>
    </a>
    <div class="section-card" v-if="adminBackends.length !== 0">
      <h2 class="custom-card-title title-card">
        {{ $gettext("your currencies") }}
      </h2>
      <div v-for="b in adminBackends">
        <CurrencyItem
          v-for="a in b.userAccounts"
          class="mb-5"
          :class="{
            selected: b?.internalId === currency?.internalId,
          }"
          @currencySelected="$emit('currencySelected', b)"
          :isCurrencySelected="b?.internalId === currency?.internalId"
          :currency="a"
          :refreshCurrency="refreshCurrency"
          @update:currencyRefreshing="(x) => (currencyRefreshing = x)"
        >
        </CurrencyItem>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import CurrencyItem from "./CurrencyItem.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/css/index.css"

  let interval: any

  @Options({
    name: "TheCurrencyList",
    props: {
      currency: Object,
      refreshToggle: Boolean,
    },
    data() {
      return {
        currenciesLoading: true,
        currencyRefreshing: false,
        adminBackends: [],
        refreshCurrency: false,
      }
    },
    components: {
      CurrencyItem,
      Loading,
    },
    async mounted() {
      const currenciesRefreshInterval =
        this.$config.currenciesRefreshInterval || 90

      if (currenciesRefreshInterval !== -1) {
        if (interval) clearInterval(interval)

        interval = setInterval(() => {
          this.toggleRefreshBalance()
        }, Math.max(10000, currenciesRefreshInterval * 1000))
      }
      this.adminBackends = await this.getAdminBackends()
      this.currenciesLoading = false
    },
    unmounted() {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    },
    computed: {},
    watch: {
      async refreshToggle(newval, oldVal): Promise<void> {
        this.adminBackends = await this.getAdminBackends()
        this.currencyRefreshing = true
        this.refreshCurrency = { retryUntilChange: true }
      },
    },
    methods: {
      async getAdminBackends() {
        const backends = await this.$lokapi.getBackends()
        if (!backends) {
          return []
        }
        const backendList = Object.values(backends)

        const backendChecks = await Promise.all(
          backendList.map(async (backend: any) => {
            // Backends whose user accounts don't implement
            // getCurrencySupply are not yet fully administrable and
            // should not appear in the admin dashboard currency list.
            const userAccounts = Object.values(backend.userAccounts || {})
            if (!userAccounts.some((ua: any) => ua.getCurrencySupply)) {
              return false
            }
            return (
              (await backend.hasCreditRequestValidationRights()) ||
              (await backend.hasUserAccountValidationRights()) ||
              (await backend.canSearchAllRecipients())
            )
          })
        )
        const filteredBackendList = backendList.filter(
          (backend, index) => backendChecks[index]
        )
        if (!this.currency && filteredBackendList.length > 0) {
          this.$emit("currencySelected", filteredBackendList[0])
        }
        return filteredBackendList
      },
      async toggleRefreshBalance() {
        this.currencyRefreshing = true
        this.refreshCurrency = !this.refreshCurrency
      },
    },
  })
  export default class TheCurrencyList extends Vue {}
</script>
<style lang="scss" scoped>
  @import "../assets/custom-variables.scss";

  .refresh {
    margin-top: -1.2em;
    z-index: 1;
  }
  .active-refresh-button {
    border-color: transparent;
    background-color: transparent;
    pointer-events: none;
    cursor: default;
  }
  .active-refresh-button .icon {
    color: $top-menu-link-color;
  }
</style>
