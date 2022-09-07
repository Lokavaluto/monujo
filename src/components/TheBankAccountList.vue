<template>
  <div class="accounts card custom-card custom-card-padding">
    <loading
      v-model:active="isLoadingAccounts"
      :can-cancel="false"
      :is-full-page="false"
    />

    <div class="active" v-if="!isLoadingAccounts">
      <a
        @click="refreshBalanceAndTransactions"
        :title="$t('wallets.list.action_refresh_link_title')"
        class="button is-default is-pulled-right is-rounded refresh"
      >
        <span>{{ $t("wallets.list.action_refresh") }}</span>
        <span class="icon is-small">
          <fa-icon icon="sync" />
        </span>
      </a>
      <div
        class="notification is-danger is-light"
        v-if="hasAccountsLoadingError"
      >
        <p
          class="mb-4"
          v-html="$t('wallets.list.msg_error_loading_wallets')"
        ></p>
      </div>
      <p
        class="notification is-default notification-no-accounts"
        v-else-if="totalAccountsLoaded === 0"
      >
        <i18n-t keypath="wallets.list.msg_no_account_yet" tag="span">
          <router-link to="/create-account">{{
            $t("wallets.list.msg_no_account_yet_link_text")
          }}</router-link>
        </i18n-t>
      </p>
      <div v-else>
        <h2 class="custom-card-title">
          {{ $t("wallets.list.title_your_accounts") }}
        </h2>
        <BankAccountItem
          v-for="account in activeVirtualAccounts"
          :bal="account.bal"
          :curr="account.curr"
          :backend="account.backend"
          :type="account.type"
          :active="account.active"
          :subAccounts="account.subAccounts || []"
          class="mb-5"
        >
          <template v-slot:name>{{ account.name }}</template>
        </BankAccountItem>
      </div>
    </div>
    <div class="inactive" v-if="inactiveVirtualAccounts.length > 0">
      <h2 class="custom-card-title">
        {{ $t("wallets.list.title_your_pending_accounts") }}
      </h2>
      <BankAccountItem
        v-for="account in inactiveVirtualAccounts"
        :bal="account.bal"
        :curr="account.curr"
        :backend="account.backend"
        :type="account.type"
        :active="account.active"
      >
        <template v-slot:name>{{ account.name }}</template>
      </BankAccountItem>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import { mapGetters, mapState } from "vuex"
  import BankAccountItem from "./BankAccountItem.vue"
  import Loading from "vue-loading-overlay"
  import "vue-loading-overlay/dist/vue-loading.css"

  @Options({
    name: "TheBankAccountList",
    props: {
      loaded: Boolean,
    },
    components: {
      BankAccountItem,
      Loading,
    },
    computed: {
      totalAccountsLoaded(): number {
        return this.$store.state.lokapi.virtualAccountTree.length
      },
      isLoadingAccounts(): boolean {
        return this.$store.state.lokapi.accountsLoading
      },
      hasAccountsLoadingError(): boolean {
        return this.$store.state.lokapi.accountsLoadingError
      },
      ...mapGetters(["activeVirtualAccounts", "inactiveVirtualAccounts"]),
    },
    methods: {
      refreshBalanceAndTransactions() {
        this.$lokapi.flushBackendCaches()
        this.$store.dispatch("fetchAccounts")
        this.$store.dispatch("resetTransactions")
      },
    },
  })
  export default class TheBankAccountList extends Vue {}
</script>
<style lang="scss" scoped>
  .refresh {
    margin-top: -9px;
    z-index: 1;
  }
</style>