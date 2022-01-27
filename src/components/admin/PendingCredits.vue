<template>
  <div class="container mt-5">
    <div class="columns is-tablet">
      <div class="column">
        <div
          class="accounts card custom-card custom-card-padding"
        >
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
                  {{request.recipient.name}} {{ request.recipient.markBackend ? `(via ${request.recipient.backendId})` : ""}}
                </td>
                <td>
                  {{request.amount}}
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
    validateCreditRequest(request: any):void {
      request.validate()
        .catch((err: any) => {
          this.$Swal.fire({
            position: 'top',
            icon: 'error',
            title: 'Il y a eu un problème lors de la tentative de validation de la demande de crédit' + request.name,
            showConfirmButton: false,
            timer: 3000
          })
        }).then((result: any) => {
          this.$store.dispatch('fetchPendingCreditRequests')
          this.$Swal.fire({
            position: 'top',
            icon: 'success',
            title: 'La demande de crédit de ' + request.name + ' d\'un montant de ' + request.recipient + ' a été validée',
            showConfirmButton: false,
            timer: 3000
          })
        })
    }
  },
})
export default class Admin extends Vue {}
</script>