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
      <div
        class="notification is-default notification-no-accounts"
        v-else-if="totalAccountsLoaded === 0"
      >
        {{ $gettext("You don't have any wallet yet,") }}
        <router-link to="/create-account">{{
          $gettext("click here")
        }}</router-link>
        {{ $gettext("to create one") }}
        <div class="is-flex mt-3">
          Or import an existing wallet:
          <div>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              style="display: none"
            />
            <button
              class="button is-default is-pulled-right is-rounded"
              id="import-wallet"
              @click="triggerFileInput"
            >
              Import File
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
          :bal="a.bal"
          :curr="a.curr"
          :backend="a.backend"
          :type="a.type"
          :active="a.active"
          :subAccounts="a.subAccounts || []"
          class="mb-5"
          :class="{ selected: a._obj.internalId === account?._obj?.internalId }"
          @accountSelected="$emit('accountSelected', a)"
          :qrcode="true"
          :id="a.id"
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
        :bal="account.bal"
        :curr="account.curr"
        :backend="account.backend"
        :type="account.type"
        :active="account.active"
      >
        <template v-slot:name>{{ account.name() }}</template>
      </BankAccountItem>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters, mapState } from "vuex"
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
    components: {
      BankAccountItem,
      Loading,
    },
    data() {
      return {
        fileData: null,
      }
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
      ...mapGetters(["activeVirtualAccounts", "inactiveVirtualAccounts"]),

      ...mapModuleState("lokapi", ["accountsLoading", "accountsLoadingError"]),
      ...mapGetters(["getUnconfiguredBackends"]),
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
      triggerFileInput() {
        this.$refs.fileInput.click()
      },
      async handleFileChange(event: any) {
        const file = event.target.files[0]
        if (!file) {
          console.error("No file selected")
          return
        }

        try {
          const fileContent = await readFileAsText(file)
          if (typeof fileContent !== "string") return
          const dataObject = JSON.parse(fileContent)
          this.fileData = dataObject
        } catch (error) {
          console.error("Error processing the file:", error)
        }
        await this.registerWallet()
      },
      async registerWallet() {
        try {
          await this.$store.dispatch("registerWallet", [
            this.fileData,
            this.getUnconfiguredBackends(),
          ])
        } catch (err: any) {
          console.error(
            "Something went wrong on createUserAccount request",
            err
          )
          this.$msg.error(this.$gettext("Wallet already created"))
        }
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
