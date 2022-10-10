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
        title="Rafraîchir le solde et les transactions"
        class="button is-default is-pulled-right is-rounded refresh"
      >
        <span>Rafraîchir</span>
        <span class="icon is-small">
          <fa-icon icon="sync" />
        </span>
      </a>
      <div
	class="notification is-danger is-light"
	v-if="accountsLoadingError"
      >
        <p class="mb-4">
          Une erreur inattendue est survenue pendant le chargement des
          portefeuilles. Veuillez nous excuser pour le désagrément.
        </p>
        <p>
          Vous pouvez essayer de recharger la page, ou contacter votre
          administrateur si l'erreur persiste.
        </p>
      </div>
      <p
        class="notification is-default notification-no-accounts"
        v-else-if="totalAccountsLoaded === 0"
      >
        Vous n'avez pas encore de portefeuille,
        <router-link to="/create-account">cliquez ici</router-link> pour en
        créer un.
      </p>
      <div v-else>
        <h2 class="custom-card-title">vos comptes</h2>
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
      <h2 class="custom-card-title">vos comptes en attente de création</h2>
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
