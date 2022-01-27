<template>
  <div class="container mt-5">
    <div class="columns is-tablet">
      <div class="column">
        <div
          class="accounts card custom-card custom-card-padding"
        >
          <h2 class="custom-card-title">Comptes en attente de validation</h2>
          <table class="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th class="has-text-right">Valider</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="account in pendingUserAccounts">
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
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  name:"PendingAccounts",
  mounted() {
    this.$store.dispatch('fetchPendingUserAccounts')
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
          this.$store.dispatch('fetchPendingUserAccounts')
          this.$Swal.fire({
            position: 'top',
            icon: 'success',
            title: 'Le compte de l\'utilisateur ' + account.name + ' a été validé',
            showConfirmButton: false,
            timer: 3000
          })
        })
    }
  },
})
export default class Admin extends Vue {}
</script>