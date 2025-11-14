<template>
  <div class="accounts card custom-card custom-card-padding">
    <loading
      v-if="!activeVirtualAccounts.length"
      v-model:active="accountsLoading"
      :can-cancel="false"
      :is-full-page="false"
    />
    <div
      class="active flex"
      v-if="!accountsLoading || activeVirtualAccounts.length"
    >
      <span
        ><a
          @click="toggleRefreshBalance()"
          :title="$gettext('Refresh balance and transaction list')"
          class="button is-default is-pulled-right is-rounded refresh"
          :class="{
            'active-refresh-button':
              accountsLoading || isAccountsLoadingRetrying,
          }"
        >
          <span :class="{ hide: accountsLoading || isAccountsLoadingRetrying }">
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
      </span>
      <div class="section-card" v-if="activeVirtualAccounts.length !== 0">
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
            :refreshCurrency="!refreshCurrency"
            @update:currencyRefreshing="(x) => (currencyRefreshing = x)"
          >
          </CurrencyItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters, mapState } from "vuex"
  import { UIError } from "@/exception"
  import CurrencyItem from "./CurrencyItem.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/css/index.css"
  import { mapModuleState } from "@/utils/vuex"
  import { showSpinnerMethod } from "@/utils/showSpinner"
  import applyDecorators from "@/utils/applyDecorators"

  let interval: any

  @Options({
    name: "TheCurrencyList",
    props: {
      loaded: Boolean,
      currency: Object,
      refreshToggle: Boolean,
    },
    data() {
      return {
        currencyRefreshing: false,
        isAccountsLoadingRetrying: false,
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

      if (currenciesRefreshInterval != -1) {
        if (interval) clearInterval(interval)

        interval = setInterval(() => {
          this.toggleRefreshBalance()
        }, Math.max(10000, currenciesRefreshInterval * 1000))
      }
      this.adminBackends = await this.getAdminBackends()
    },
    unmounted() {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    },
    computed: {
      totalAccountsLoaded(): number {
        return this.$store.state.lokapi.virtualAccountTree.length
      },
      ...mapGetters(["activeVirtualAccounts"]),
      ...mapModuleState("lokapi", ["accountsLoading", "accountsLoadingErrors"]),
    },
    watch: {
      async refreshToggle(newval, oldVal): Promise<void> {
        await this.refreshBalance(true)
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
            return (
              (await backend.hasCreditRequestValidationRights()) ||
              (await backend.hasUserAccountValidationRights())
            )
          })
        )
        if (!this.currency && backendList.length > 0) {
          this.$emit("currencySelected", backendList[0])
        }
        return backendList.filter((backend, index) => backendChecks[index])
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
  .create-import-wallet-btn {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
  }
  .no-wallet {
    width: 100%;
    margin: auto;
    justify-content: center;
    display: flex;
  }
</style>
