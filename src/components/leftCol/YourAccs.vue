<template>
    <!-- card vos comptes -->
    <div
      class="card custom-card custom-card-padding"
    >
      <h2 class="custom-card-title">vos comptes</h2>
      <template v-if="moneyAccounts.length > 0">
        <Acc v-for="account in moneyAccounts"
             :bal="account.bal"
             :curr="account.curr"
             :backend="account.backend"
             :type="account.type"
             >
          <template v-slot:name>{{ account.name }}</template>
        </Acc>
      </template>
      <template v-else-if="areMoneyAccountsLoaded">
        <p class="notification is-default">Vous n'avez pas encore de compte</p>
      </template>
    </div>
    <!-- fin card vos comptes -->
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Acc from "./yourAccs/Acc.vue"

@Options({
    name:"YourAccs",
    props: {
      loaded: Boolean,
    },
    components: {
        Acc
    },
    computed: {
      moneyAccounts(): any {
        return this.$store.state.lokapi.accounts
      },
      areMoneyAccountsLoaded(): boolean {
        return this.$store.state.lokapi.accountsLoaded
      }
    }
})
export default class YourAccs extends Vue {}
</script>