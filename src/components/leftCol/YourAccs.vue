<template>
    <!-- card vos comptes -->
    <div
      class="accounts card custom-card custom-card-padding"
    >
      <h2 class="custom-card-title">vos comptes</h2>
      <div v-if="activeMoneyAccounts.length > 0">
        <Acc v-for="account in activeMoneyAccounts"
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
      <div class="inactive" v-if="inactiveMoneyAccounts.length > 0">
        <h2 class="custom-card-title">En attente d'activation</h2>
        <Acc v-for="account in inactiveMoneyAccounts"
             :bal="account.bal"
             :curr="account.curr"
             :backend="account.backend"
             :type="account.type"
             :active="account.active"
             >
          <template v-slot:name>{{ account.name }}</template>
        </Acc>
      </div>
      <div class="notification p-6" v-if="isLoadingMoneyAccounts">
        <loading v-model:active="isLoadingMoneyAccounts"
           :can-cancel="false"
           :is-full-page="false"/>
      </div>
      <div class="notification" v-if="!isLoadingMoneyAccounts && totalAccountsLoaded === 0">
        <p class="notification is-default">Vous n'avez pas encore de compte</p>
      </div>
    </div>
    <!-- fin card vos comptes -->
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
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
        Loading
    },
    computed: {
      activeMoneyAccounts(): any {
        return this.$store.state.lokapi.accounts.filter((a: any) => a.active === true)
      },
      inactiveMoneyAccounts(): any {
        return this.$store.state.lokapi.accounts.filter((a: any) => a.active === false)
      },
      isLoadingMoneyAccounts(): boolean {
        return this.$store.state.lokapi.accountsStatus === 'loading'
      },
      totalAccountsLoaded(): number {
        return this.$store.state.lokapi.accounts.length
      }
    }
})
export default class YourAccs extends Vue {}
</script>