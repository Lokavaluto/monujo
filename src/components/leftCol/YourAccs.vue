<template>
  <!-- card vos comptes -->
  <div
    class="accounts card custom-card custom-card-padding"
  >
    <a
      @click="refreshBalanceAndTransactions"
      title="Rafraîchir le solde et les transactions"
      class="button is-default is-pulled-right is-rounded refresh"
    >
      <span>Rafraîchir</span>
      <span class="icon is-small">
        <i class="fas fa-sync"></i>
      </span>
    </a>
    <h2 class="custom-card-title">vos comptes</h2>
    <loading v-model:active="isLoadingAccounts"
             :can-cancel="false"
             :is-full-page="false"/>
    
    <div class="active">
      <p class="notification is-default" v-if="!isLoadingAccounts && totalAccountsLoaded === 0">Vous n'avez pas encore de compte</p>
      <Acc v-for="account in activeVirtualAccounts"
           :bal="account.bal"
           :curr="account.curr"
           :backend="account.backend"
           :type="account.type"
           :active="account.active"
           :subAccounts="account.subAccounts || []"
      >
        <template v-slot:name>{{ account.name }}</template>
      </Acc>
    </div>
    <div class="inactive" v-if="inactiveVirtualAccounts.length > 0">
      <h2 class="custom-card-title">vos comptes en attente de création</h2>
      <Acc v-for="account in inactiveVirtualAccounts"
           :bal="account.bal"
           :curr="account.curr"
           :backend="account.backend"
           :type="account.type"
           :active="account.active"
      >
        <template v-slot:name>{{ account.name }}</template>
      </Acc>
    </div>
  </div>
  <!-- fin card vos comptes -->
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { mapGetters, mapState } from 'vuex'
  import Acc from "./yourAccs/Acc.vue"
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';

  @Options({
    name:"YourAccs",
    props: {
      loaded: Boolean,
      
    },
    components: {
      Acc,
      Loading: Loading
    },
    computed: {
      totalAccountsLoaded(): number {
        return this.$store.state.lokapi.virtualAccountTree.length
      },
      isLoadingAccounts(): boolean {
        return this.$store.state.lokapi.accountsLoading
      },
      ...mapGetters([
        'activeVirtualAccounts',
        'inactiveVirtualAccounts',
      ]),
    },
    methods: {
      refreshBalanceAndTransactions() {
        this.$store.dispatch('fetchAccounts')
        this.$store.dispatch('resetTransactions')
      }
    }
  })
  export default class YourAccs extends Vue {}
</script>
<style lang="scss" scoped>
.refresh {
  margin-top: -9px;
}
</style>