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
        @click="refreshBalanceAndTransactions"
        :title="$gettext('Refresh balance and transaction list')"
        class="button is-default is-pulled-right is-rounded refresh"
        :class="{ 'active-refresh-button': accountsLoading }"
      >
        <span :class="{ hide: accountsLoading }">
          {{ $gettext("Refresh") }}
        </span>
        <span class="icon is-small">
          <fa-icon :class="{ refreshing: accountsLoading }" icon="sync" />
        </span>
      </a>
      <div class="notification is-danger is-light" v-if="accountsLoadingError">
        <p class="mb-4">
          {{
            $gettext(
              "An unexpected issue occurred while loading your " +
                "wallet information."
            )
          }}
          {{ $gettext("Sorry for the inconvenience.") }}
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
      <loading
        v-if="isWalletUploading"
        v-model:active="isWalletUploading"
        :can-cancel="false"
        :is-full-page="false"
      />
      <div
        class="notification is-default notification-no-accounts"
        v-else-if="totalAccountsLoaded === 0"
      >
        {{ $gettext("You don't have any wallet yet,") }}
        <router-link to="/create-account">{{
          $gettext("click here")
        }}</router-link>
        {{ $gettext("to create one") }}
        <div v-for="backend in getUnconfiguredBackends()" class="is-flex mt-3">
          <div v-if="backend.startsWith('comchain:')">
            {{ $gettext("Or import an existing wallet") }}
            <input
              type="file"
              @change="(event) => registerWalletHandle(event, backend)"
              style="display: none"
            />
            <button
              class="button is-default is-pulled-right is-rounded"
              id="import-wallet"
              @click="triggerFileInput"
            >
              {{ $gettext("Import") }}
            </button>
          </div>
        </div>
      </div>
      <div class="section-card" v-else-if="activeVirtualAccounts.length !== 0">
        <h2 class="custom-card-title title-card">
          {{ $gettext("your accounts") }}
        </h2>
        <BankAccountItem
          v-for="a in activeVirtualAccountsMiddleware"
          class="mb-5"
          :class="{ selected: a._obj.internalId === account?._obj?.internalId }"
          @accountSelected="$emit('accountSelected', a)"
          :show-actions="a._obj.internalId === account?._obj?.internalId"
          :account="a"
          showSubAccounts="true"
          @refreshTransaction="refreshBalanceAndTransactions()"
        >
          <template v-slot:name>{{ a.name() }}</template>
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

  let interval: any

  function readFileAsText(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }
  @Options({
    name: "TheBankAccountList",
    props: {
      loaded: Boolean,
      account: Object,
    },
    data() {
      return {
        isWalletUploading: false,
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
        const accounts = this.activeVirtualAccounts
        if (!this.account && accounts.length > 0) {
          this.$emit("accountSelected", accounts[0])
        }
        return accounts
      },
      ...mapGetters([
        "activeVirtualAccounts",
        "inactiveVirtualAccounts",
        "getUnconfiguredBackends",
        "getBackends",
      ]),
      ...mapModuleState("lokapi", ["accountsLoading", "accountsLoadingError"]),
    },
    watch: {
      getUnconfiguredBackends(newval, oldval): void {
        if (newval.length === 1) {
          this.form.accountBackend = newval[0]
        }
      },
    },
    methods: {
      refreshBalanceAndTransactions() {
        this.$lokapi.flushBackendCaches()
        this.$store.dispatch("fetchAccounts")
        this.$emit("refreshTransaction")
      },
      triggerFileInput(event: any) {
        event.target.parentElement.querySelector("input[type=file]").click()
      },
      async registerWalletHandle(event: any, backendId: any) {
        const backend = this.getBackends()[backendId]
        const file = event.target.files[0]
        if (!file) {
          // This doesn't happen even if user has canceled dialog
          // and it is not clear when this actually occurs.
          console.log("Unexpectedly received no file. Ignoring.")
          return
        }

        let fileContent: unknown
        try {
          fileContent = await readFileAsText(file)
        } catch (err) {
          throw new UIError(
            this.$gettext("Failed to read the file contents"),
            err
          )
        }
        if (typeof fileContent !== "string")
          // typeguard
          throw new UIError(this.$gettext("Unexpected type of file"), null)
        let fileData: any
        try {
          fileData = JSON.parse(fileContent)
        } catch (err) {
          throw new UIError(this.$gettext("Unexpected format of file"), err)
        }
        this.isWalletUploading = true
        try {
          await backend.registerWallet(fileData)
        } catch (err: any) {
          if (err.message === "User canceled the dialog box") {
            return false
          }
          throw new UIError(
            this.$gettext("Wallet registration unexpectedly failed") +
              " " +
              this.$gettext("Please try again or contact your administrator"),
            err
          )
        } finally {
          this.isWalletUploading = false
        }
        this.$lokapi.clearBackendCache()
        this.$store.dispatch("setBackends")
        this.$store.dispatch("fetchAccounts")
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
  #import-wallet {
    position: relative;
    bottom: 0.4em;
  }
</style>
