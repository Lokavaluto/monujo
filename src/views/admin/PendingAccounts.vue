<template>
  <main class="main">
    <div class="container mt-5">
      <div class="columns is-tablet">
        <div class="column">
           <loading v-model:active="isLoading"
                 :can-cancel="false"
                 :is-full-page= "true"/>
          <div
            v-if="!isLoading" class="accounts card custom-card custom-card-padding"
          >
         <div v-if="pendingUserAccounts.length === 0">Aucun compte en attente de validation</div>
         
        <div v-else>
         <h2 class="custom-card-title">Comptes en attente de validation</h2>
          <table   class="table is-striped is-fullwidth">
           <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th class="has-text-right">Valider</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="account in pendingUserAccounts" :key="account.id">
                  <td>
                    {{account.name}} {{ account.markBackend ? `(via ${account.backendId})` : ""}}
                  </td>
                  <td class="has-text-right">
                    <a
                      class="button is-primary custom-button custom-inverted is-small is-pulled-right"
                      v-on:click="validateUserAccount(account)"
                    >
                      valider
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
    import Loading from 'vue-loading-overlay';

@Options({
  name:"PendingAccounts",
  components :{ Loading: Loading },
  data() {
    return {
      isLoading: false,
    }
  },
  mounted() {
    this.updatePendingAccount()
  },
  computed: {
    pendingUserAccounts(): Array<any> {
      return this.$store.state.lokapi.pendingUserAccounts
    }
  },
  methods: {
    validateUserAccount(account: any):void {
      account.validateCreation()
        .catch((err: any) => {
          this.$Swal.fire({
            position: 'top',
            icon: 'error',
            title: 'Il y a eu un problème lors de la tentative de validation de l\'utilisateur ' + account.name,
            showConfirmButton: false,
            timer: 3000
          })
        }).then((result: any) => {
          this.updatePendingAccount()
          this.$Swal.fire({
            position: 'top',
            icon: 'success',
            title: 'Le compte de l\'utilisateur ' + account.name + ' a été validé',
            showConfirmButton: false,
            timer: 3000
          })
        })
    },
    async updatePendingAccount(){
      this.isLoading = true
      await this.$store.dispatch('fetchPendingUserAccounts')
      this.isLoading = false
    }
  },
})
export default class Admin extends Vue {}
</script>