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
                  {{
                    $gettext(
                      "An unexpected issue occurred while loading the " +
                        "top up request list. Sorry for the inconvenience"
                    )
                  }}
                </p>
                <p>
                  {{
                    $gettext(
                      "You can try to refresh the page, if the issue " +
                        "persists, you may want to contact your " +
                        "administrator"
                    )
                  }}
                </p>
              </div>
              <p
                class="notification is-default"
                v-else-if="pendingCreditRequests.length === 0"
              >
                {{ $gettext("No top up request awaiting approval") }}
              </p>
              <div v-else>
                <h2 class="custom-card-title">
                  {{ $gettext("Top up requests await approval") }}
                </h2>
                <table class="table is-striped is-fullwidth">
                  <thead>
                    <tr>
                      <th class="row-user-header">
                        {{ $gettext("User") }}
                      </th>
                      <th class="row-amount-header">
                        {{ $gettext("Amount") }}
                      </th>
                      <th class="row-validate-header has-text-right">
                        {{ $gettext("Approve") }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="request in pendingCreditRequests"
                      v-bind:key="request"
                    >
                      <td class="row-user">
                        {{ request.related }}
                        {{
                          request.markBackend ? `(on ${request.backendId})` : ""
                        }}
                      </td>
                      <td>
                        {{ numericFormat(parseFloat(request.amount)) }}
                        {{ request.currency }}
                      </td>
                      <td class="has-text-right">
                        <a
                          class="
                            button
                            is-primary
                            custom-button custom-inverted
                            is-small is-pulled-right
                          "
                          v-on:click="validateCreditRequest(request)"
                          v-if="
                            selectedItem !== request || !isWaitingForValidation
                          "
                        >
                          {{ $gettext("Approve") }}
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
  import { mapGetters } from "vuex"
  import { Options, Vue } from "vue-class-component"
  import Loading from "vue-loading-overlay"

  @Options({
    name: "PendingCredits",
    components: { Loading: Loading },
    data() {
      return {
        isLoading: true,
        hasLoadingError: false,
        isWaitingForValidation: false,
        selectedItem: null,
      }
    },
    mounted() {
      this.updatePendingCreditRequests()
    },
    computed: {
      pendingCreditRequests(): Array<any> {
        return this.$store.state.lokapi.pendingCreditRequests
      },
      ...mapGetters(["numericFormat"]),
    },
    methods: {
      async validateCreditRequest(request: any): Promise<void> {
        this.selectedItem = request
        try {
          this.isWaitingForValidation = true
          await request.validate()
        } catch (err) {
          this.isWaitingForValidation = false
          if (err.message === "User canceled the dialog box") {
            // A warning message should have already been sent
            return
          }
          this.$msg.error(
            this.$gettext(
              "An issue occured upon the approval of the credit " +
                "request of %{ name }",
              {
                name: request.related,
              }
            )
          )
          throw err
        }
        this.isWaitingForValidation = false
        this.selectedItem = null
        this.$store.dispatch("fetchPendingCreditRequests")
        this.$msg.success(
          this.$gettext(
            "Top up request from %{ name } of %{ amount } was validated.",
            {
              name: request.relatedUser,
              amount: request.amount,
            }
          )
        )
        this.isLoading = false
      },
      async updatePendingCreditRequests() {
        this.isLoading = true
        try {
          await this.$store.dispatch("fetchPendingCreditRequests")
          this.hasLoadingError = false
        } catch (e: any) {
          console.error("Failed to fetch pending credit requests", e)
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
   width: 60%
  .row-amount-header
   width: 20%
  .row-validate-header
   width: 20%
  .row-user
   overflow: hidden
   text-overflow: ellipsis
  table
   table-layout: fixed
</style>
