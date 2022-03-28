<template>
  <main class="main">
    <div class="container mt-5">
      <div class="columns is-tablet">
        <div class="column">
          <div
            class="accounts card custom-card custom-card-padding"
          >
            <p
              class="notification is-default"
              v-if="pendingCreditRequests.length === 0"
            >Aucune demande de crédit en attente de validation</p>
            <div v-else>
              <h2 class="custom-card-title">Opérations de crédit en attente de validation</h2>
              <table class="table is-striped is-fullwidth">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Montant</th>
                    <th class="has-text-right">Valider</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in pendingCreditRequests">
                    <td>
                      {{request.relatedUser}} {{ request.markBackend ? `(on ${request.backendId})` : ""}}
                    </td>
                    <td>
                      {{
                        parseFloat(request.amount).toLocaleString(
                          "fr", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })
                      }} {{request.currency}}
                    </td>
                    <td class="has-text-right">
                      <a
                        class="button is-primary custom-button custom-inverted is-small is-pulled-right"
                        v-on:click="validateCreditRequest(request)"
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

  @Options({
    name:"PendingCredits",
    mounted() {
      this.$store.dispatch('fetchPendingCreditRequests')
    },
    computed: {
      pendingCreditRequests(): Array<any> {
        return this.$store.state.lokapi.pendingCreditRequests
      }
    },
    methods: {
      async validateCreditRequest (request: any): Promise<void> {
        try {
          await request.validate()
        } catch(err) {
          this.$Swal.fire({
            position: 'top',
            icon: 'error',
            title: 'Il y a eu un problème lors de la tentative de validation de la demande de crédit' + request.relatedUser,
            showConfirmButton: false,
            timer: 3000
          })
          throw err
        }
        this.$store.dispatch('fetchPendingCreditRequests')
        this.$Swal.fire({
          position: 'top',
          icon: 'success',
          title: 'La demande de crédit de ' + request.relatedUser + ' d\'un montant de ' + request.amount + ' a été validée',
          showConfirmButton: false,
          timer: 3000
        })
      }
    },
  })
  export default class Admin extends Vue {}
</script>