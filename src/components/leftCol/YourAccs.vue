<template>
    <!-- card vos comptes -->
    <div
      class="accounts card custom-card custom-card-padding"
    >
      <div class="active" v-if="activeVirtualAccounts.length > 0">
        <h2 class="custom-card-title">vos comptes</h2>
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
      <div class="notification" v-if="accountsLoaded && totalAccountsLoaded === 0">
        <p class="notification is-default">Vous n'avez pas encore de compte</p>
      </div>
    </div>
    <!-- fin card vos comptes -->
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { mapGetters, mapState } from 'vuex'
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
      totalAccountsLoaded(): number {
        return this.$store.state.lokapi.virtualAccountTree.length
      },
      ...mapGetters([
        'activeVirtualAccounts',
        'inactiveVirtualAccounts',
      ]),
      ...mapState([
                'accountsLoaded',
      ]),
    }
})
export default class YourAccs extends Vue {}
</script>