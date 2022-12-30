<template>
  <div class="accounts card custom-card custom-card-padding">
    <loading
      v-model:active="accountsLoading"
      :can-cancel="false"
      :is-full-page="false"
    />

    <div class="active" v-if="!accountsLoading">
      <a
        @click="refreshBalanceAndTransactions"
        :title="$gettext('Refresh balance and transaction list')"
        class="button is-default is-pulled-right is-rounded refresh"
      >
        <span>{{ $gettext("Refresh") }}</span>
        <span class="icon is-small">
          <fa-icon icon="sync" />
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
      <p
        class="notification is-default notification-no-accounts"
        v-else-if="totalAccountsLoaded === 0"
      >
        {{ $gettext("You don't have any wallet yet,") }}
        <router-link to="/create-account">{{
          $gettext("click here")
        }}</router-link>
        {{ $gettext("to create one.") }}
      </p>
      <div v-else-if="activeVirtualAccounts.length !== 0">
        <h2 class="custom-card-title">
          {{ $gettext("your accounts") }}
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
          <template v-slot:name>{{ account.name() }}</template>
        </BankAccountItem>
      </div>
    </div>
    <div class="inactive" v-if="inactiveVirtualAccounts.length > 0">
      <h2 class="custom-card-title">
        {{ $gettext("your pending accounts") }}
      </h2>
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
  import "vue-loading-overlay/dist/vue-loading.css"
  import { mapModuleState } from "@/utils/vuex"
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
      ...mapGetters(["activeVirtualAccounts", "inactiveVirtualAccounts"]),

      ...mapModuleState("lokapi", ["accountsLoading", "accountsLoadingError"]),
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
