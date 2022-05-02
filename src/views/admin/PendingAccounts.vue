<template>
  <main class="main">
    <div class="container mt-5">
      <div class="columns is-tablet">
        <div class="column">
          <div class="accounts card custom-card custom-card-padding">
            <loading
              v-model:active="isLoading"
              :can-cancel="false"
              :is-full-page="false"
            />
            <div v-if="!isLoading">
              <div
                class="notification is-danger is-light"
                v-if="hasLoadingError"
              >
                <p class="mb-4">
                  Une erreur inattendue est survenue pendant le chargement de la
                  liste des comptes. Veuillez nous excuser pour le désagrément.
                </p>
                <p>
                  Vous pouvez essayer de recharger la page, ou contacter votre
                  administrateur si l'erreur persiste.
                </p>
              </div>
              <p
                class="notification is-default"
                v-else-if="pendingUserAccounts.length === 0"
              >
                Aucun compte en attente de validation
              </p>
              <div v-else>
                <h2 class="custom-card-title">
                  Comptes en attente de validation
                </h2>
                <table class="table is-striped is-fullwidth">
                  <thead>
                    <tr>
                      <th class="row-user-header">Utilisateur</th>
                      <th class="has-text-right row-validate-header">
                        Valider
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="account in pendingUserAccounts"
                      :key="account.id"
                    >
                      <td class="row-user">
                        {{ account.name }}
                        {{
                          account.markBackend
                            ? `(via ${account.backendId})`
                            : ""
                        }}
                      </td>
                      <td class="has-text-right">
                        <a
                          class="button is-primary custom-button custom-inverted is-small is-pulled-right"
                          v-on:click="validateUserAccount(account)"
                          v-if="
                            selectedItem !== account || !isWaitingForValidation
                          "
                        >
                          valider
                        </a>
                        <div
                          v-else
                          class="transactions-loader-container is-pulled-right"
                        >
                          <loading
                            v-model:active="isWaitingForValidation"
                            :can-cancel="false"
                            :is-full-page="false"
                            :width="30"
                            :height="30"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
  import { Options, Vue } from "vue-class-component"
  import Loading from "vue-loading-overlay"

  @Options({
    name: "PendingAccounts",
    components: { Loading: Loading },
    data() {
      return {
        isLoading: false,
        hasLoadingError: false,
        isWaitingForValidation: false,
        selectedItem: null,
      }
    },
    mounted() {
      this.updatePendingAccount()
    },
    computed: {
      pendingUserAccounts(): Array<any> {
        return this.$store.state.lokapi.pendingUserAccounts
      },
    },
    methods: {
      validateUserAccount(account: any): void {
        this.selectedItem = account
        this.isWaitingForValidation = true
        account
          .validateCreation()
          .catch((err: any) => {
            this.isWaitingForValidation = false
            this.$Swal.fire({
              position: "top",
              icon: "error",
              title:
                "Il y a eu un problème lors de la tentative de validation de l'utilisateur " +
                account.name,
              showConfirmButton: false,
              timer: 3000,
            })
          })
          .then((result: any) => {
            this.isWaitingForValidation = false
            this.updatePendingAccount()
            this.$Swal.fire({
              position: "top",
              icon: "success",
              title:
                "Le compte de l'utilisateur " + account.name + " a été validé",
              showConfirmButton: false,
              timer: 3000,
            })
          })
      },
      async updatePendingAccount() {
        this.isLoading = true
        try {
          await this.$store.dispatch("fetchPendingUserAccounts")
          this.hasLoadingError = false
        } catch (e: any) {
          console.error("Failed to fetch pending accounts", e)
          this.hasLoadingError = true
        }
        this.isLoading = false
      },
    },
  })
  export default class Admin extends Vue {}
</script>
<style scoped lang="sass">
  .row-user-header
   width: 80%
  .row-validate-header
   width: 20%
  .row-user
   overflow: hidden
   text-overflow: ellipsis
  table
   table-layout: fixed
</style>
