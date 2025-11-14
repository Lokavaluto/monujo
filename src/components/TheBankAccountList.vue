<template>
  <div class="accounts card custom-card custom-card-padding">
    <loading
      v-if="!activeVirtualAccounts.length"
      v-model:active="accountsLoading"
      :can-cancel="false"
      :is-full-page="false"
    />

    <div class="active" v-if="!accountsLoading || activeVirtualAccounts.length">
      <a
        @click="refreshBalance(), refreshTransactions()"
        :title="$gettext('Refresh balance and transaction list')"
        class="button is-default is-pulled-right is-rounded refresh"
        :class="{
          'active-refresh-button': accountsLoading || isAccountsLoadingRetrying,
        }"
      >
        <span :class="{ hide: accountsLoading || isAccountsLoadingRetrying }">
          {{ $gettext("Refresh") }}
        </span>
        <span class="icon is-small">
          <fa-icon
            :class="{
              refreshing: accountsLoading || isAccountsLoadingRetrying,
            }"
            icon="sync"
          />
        </span>
      </a>
      <div
        class="notification is-danger is-light"
        v-if="accountsLoadingErrors.length > 0"
      >
        <p class="mb-4">
          {{
            $gettext(
              "An unexpected issue occurred while loading your " +
                "wallet information. Sorry for the inconvenience."
            )
          }}
        </p>
        <p class="mb-4">
          {{
            $gettext(
              "You can try to refresh the page, if the issue " +
                "persists, you may want to contact your " +
                "administrator"
            )
          }}
        </p>
      </div>
      <div
        class="notification is-default notification-no-accounts"
        v-else-if="
          accountsLoadingErrors.length == 0 &&
          totalAccountsLoaded === 0 &&
          getUnconfiguredBackends().length === 0
        "
      >
        {{ $gettext("You don't have any wallet yet.") }}
      </div>
      <div
        class="notification is-default notification-no-accounts"
        v-else-if="
          accountsLoadingErrors.length == 0 &&
          totalAccountsLoaded === 0 &&
          getUnconfiguredBackends().length > 0
        "
      >
        <div class="no-wallet">
          {{ $gettext("You don't have any wallet yet.") }}
        </div>
        <div class="flex mt-3">
          <a
            @click="createImportWallet"
            class="button is-default is-rounded create-import-wallet-btn"
          >
            <span
              :class="{ hide: accountsLoading || isAccountsLoadingRetrying }"
            >
              <span v-if="!$config.disableImportWallet">{{
                $gettext("Create or import my wallet")
              }}</span>
              <span v-else>
                {{ $gettext("Create my wallet") }}
              </span>
            </span>
          </a>
        </div>
      </div>
      <div class="section-card" v-else-if="activeVirtualAccounts.length !== 0">
        <h2 class="custom-card-title title-card">
          {{ $gettext("your accounts") }}
        </h2>
        <BankAccountItem
          v-for="(a, idx) in activeVirtualAccountsMiddleware"
          :class="{
            selected:
              a?.active && a?._obj?.internalId === account?._obj?.internalId,
            'mb-5': idx !== activeVirtualAccountsMiddleware.length - 1
            }"
          @accountSelected="$emit('accountSelected', a)"
          :isAccountSelected="
            a?.active && a._obj.internalId === account?._obj?.internalId
          "
          :account="a"
          showSubAccounts="true"
          @refreshTransaction="refreshTransactions()"
          @refreshAccounts="refreshBalance(true)"
        >
          <template v-slot:name>{{
            a.name ? a.name() : $gettext("Unavailable")
          }}</template>
        </BankAccountItem>
      </div>
    </div>
    <div
      class="inactive section-card"
      v-if="inactiveVirtualAccounts.length > 0"
    >
      <h2 class="custom-card-title">
        {{ $gettext("your pending accounts") }}
      </h2>
      <p>
        {{
          $gettext(
            "The accounts listed below have been subjected to " +
              "a creation request. Once the creation request is" +
              " approved, these accounts will become usable."
          )
        }}
      </p>
      <BankAccountItem
        v-for="account in inactiveVirtualAccounts"
        :account="account"
      >
        <template v-slot:name>{{ account.name() }}</template>
      </BankAccountItem>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters, mapState } from "vuex"
  import { UIError } from "@/exception"
  import BankAccountItem from "./BankAccountItem.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/css/index.css"
  import { mapModuleState } from "@/utils/vuex"
  import { showSpinnerMethod } from "@/utils/showSpinner"
  import applyDecorators from "@/utils/applyDecorators"

  let interval: any

  @Options({
    name: "TheBankAccountList",
    props: {
      loaded: Boolean,
      account: Object,
      refreshToggle: Boolean,
    },
    data() {
      return {
        isWalletUploading: false,
        isAccountsLoadingRetrying: false,
      }
    },
    components: {
      BankAccountItem,
      Loading,
    },
    mounted() {
      const accountsRefreshInterval = this.$config.accountsRefreshInterval || 90

      if (accountsRefreshInterval != -1) {
        if (interval) clearInterval(interval)

        interval = setInterval(() => {
          this.$store.dispatch("fetchAccounts")
        }, Math.max(10000, accountsRefreshInterval * 1000))
      }
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
      activeVirtualAccountsMiddleware(this: any) {
        const accounts = this.availableVirtualAccounts
        if (!this.account && accounts.length > 0) {
          this.$emit("accountSelected", accounts[0])
        }
        return this.activeVirtualAccounts
      },
      ...mapGetters([
        "availableVirtualAccounts",
        "activeVirtualAccounts",
        "inactiveVirtualAccounts",
        "getBackends",
        "getUnconfiguredBackends",
      ]),
      ...mapModuleState("lokapi", ["accountsLoading", "accountsLoadingErrors"]),
    },
    watch: {
      async refreshToggle(newval, oldVal): Promise<void> {
        await this.refreshBalance(true)
      },
    },
    methods: {
      createImportWallet() {
        this.$router.push("/create-account")
      },
      async refreshBalance(retryUntilChange = false) {
        const balanceOrig = this.account?.bal
        const startTime = Date.now()
        let maxDuration = 0
        if (retryUntilChange) {
          maxDuration = 3000
        }
        this.isAccountsLoadingRetrying = true
        const checkBalance = async () => {
          try {
            await this.$lokapi.flushBackendCaches()
            await this.$store.dispatch("setBackends")
            await this.$store.dispatch("fetchAccounts")
          } catch (error) {
            this.$msg.error(
              this.$gettext("Failed to refresh account informations")
            )
            return
          }
          // fetch account in new account list
          const account = this.activeVirtualAccountsMiddleware.find(
            (a: any) =>
              a?.active && a?._obj.internalId === this.account?._obj.internalId
          )
          const balance = account?.bal

          if (balanceOrig === balance) {
            if (Date.now() - startTime < maxDuration) {
              setTimeout(checkBalance, 200)
              return
            } else {
              if (retryUntilChange) {
                console.log(
                  `Expected balance change didn't happen in imparted ${
                    maxDuration / 1000
                  }s`
                )
              }
            }
          }
          // XXXvlab: enforce the selection of the account as sometimes
          // it seems it doesn't register the new account
          this.$emit("accountSelected", account)
          this.isAccountsLoadingRetrying = false
        }
        await checkBalance()
      },
      async refreshTransactions() {
        this.$lokapi.flushBackendCaches()
        await this.$store.dispatch("fetchAccounts")
        this.$emit("refreshTransaction")
      },
    },
  })
  export default class TheBankAccountList extends Vue {}
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
  .section-card {
      margin-bottom: 0px !important;
  }

</style>
